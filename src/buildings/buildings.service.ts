import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotFoundException, AlreadyExistsException } from '../common/exceptions/business.exception';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { CondominiumsService } from '../condominiums/condominiums.service';

const CACHE_TTL = {
  BUILDING: 300,
  BUILDING_LIST: 60,
};

const CACHE_KEYS = {
  building: (id: string) => `building:${id}`,
  buildingsByCondominium: (condoId: string, page: number, limit: number) =>
    `buildings:condo:${condoId}:${page}:${limit}`,
  buildingListPattern: () => 'buildings:*',
};

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    private readonly condominiumsService: CondominiumsService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    // Verify condominium exists
    await this.condominiumsService.findOne(createBuildingDto.condominiumId);

    // Check for unique code within condominium
    const existingBuilding = await this.buildingRepository.findOne({
      where: {
        condominiumId: createBuildingDto.condominiumId,
        code: createBuildingDto.code,
      },
      withDeleted: true,
    });

    if (existingBuilding && !SoftDeleteRepositoryHelper.isDeleted(existingBuilding)) {
      throw new AlreadyExistsException('Building code in this condominium');
    }

    const building = this.buildingRepository.create(createBuildingDto);
    const savedBuilding = await this.buildingRepository.save(building);

    await this.cache.invalidatePattern(CACHE_KEYS.buildingListPattern());

    this.logger.log(`Building created: ${savedBuilding.id}`, BuildingsService.name, {
      buildingId: savedBuilding.id,
      condominiumId: createBuildingDto.condominiumId,
    });

    return savedBuilding;
  }

  async findAllByCondominium(
    condominiumId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Building[]; total: number }> {
    // Verify condominium exists
    await this.condominiumsService.findOne(condominiumId);

    const { page = 1, limit = 10, includeDeleted = false } = pagination;
    const cacheKey = CACHE_KEYS.buildingsByCondominium(condominiumId, page, limit);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.buildingRepository
          .createQueryBuilder('building')
          .where('building.condominium_id = :condominiumId', { condominiumId })
          .orderBy('building.created_at', 'DESC')
          .skip((page - 1) * limit)
          .take(limit);

        if (includeDeleted) {
          queryBuilder.withDeleted();
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
      },
      CACHE_TTL.BUILDING_LIST,
    );
  }

  async findOne(id: string, includeDeleted = false): Promise<Building> {
    if (includeDeleted) {
      const building = await SoftDeleteRepositoryHelper.findOneById(
        this.buildingRepository,
        id,
        { includeDeleted },
      );

      if (!building) {
        throw new NotFoundException('Building');
      }

      return building;
    }

    const cacheKey = CACHE_KEYS.building(id);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const building = await SoftDeleteRepositoryHelper.findOneById(
          this.buildingRepository,
          id,
          { includeDeleted: false },
        );

        if (!building) {
          throw new NotFoundException('Building');
        }

        return building;
      },
      CACHE_TTL.BUILDING,
    );
  }

  async update(id: string, updateBuildingDto: UpdateBuildingDto): Promise<Building> {
    const building = await this.findOne(id);

    // Check for unique code if code is being updated
    if (updateBuildingDto.code && updateBuildingDto.code !== building.code) {
      const existingBuilding = await this.buildingRepository.findOne({
        where: {
          condominiumId: building.condominiumId,
          code: updateBuildingDto.code,
        },
      });

      if (existingBuilding) {
        throw new AlreadyExistsException('Building code in this condominium');
      }
    }

    Object.assign(building, updateBuildingDto);
    const updatedBuilding = await this.buildingRepository.save(building);

    await this.invalidateBuildingCache(updatedBuilding.id);

    this.logger.log(`Building updated: ${id}`, BuildingsService.name, {
      buildingId: id,
    });

    return updatedBuilding;
  }

  async remove(id: string): Promise<void> {
    const building = await this.findOne(id);
    await SoftDeleteRepositoryHelper.softDeleteEntity(this.buildingRepository, building);

    await this.invalidateBuildingCache(id);

    this.logger.log(`Building soft deleted: ${id}`, BuildingsService.name, {
      buildingId: id,
    });
  }

  private async invalidateBuildingCache(id: string): Promise<void> {
    await Promise.all([
      this.cache.invalidate(CACHE_KEYS.building(id)),
      this.cache.invalidatePattern(CACHE_KEYS.buildingListPattern()),
    ]);
  }
}
