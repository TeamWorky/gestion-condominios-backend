import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotFoundException, AlreadyExistsException } from '../common/exceptions/business.exception';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { BuildingsService } from '../buildings/buildings.service';

const CACHE_TTL = {
  UNIT: 300,
  UNIT_LIST: 60,
};

const CACHE_KEYS = {
  unit: (id: string) => `unit:${id}`,
  unitsByBuilding: (buildingId: string, page: number, limit: number) =>
    `units:building:${buildingId}:${page}:${limit}`,
  unitListPattern: () => 'units:*',
};

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly buildingsService: BuildingsService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    // Verify building exists
    await this.buildingsService.findOne(createUnitDto.buildingId);

    // Check for unique number within building
    const existingUnit = await this.unitRepository.findOne({
      where: {
        buildingId: createUnitDto.buildingId,
        number: createUnitDto.number,
      },
      withDeleted: true,
    });

    if (existingUnit && !SoftDeleteRepositoryHelper.isDeleted(existingUnit)) {
      throw new AlreadyExistsException('Unit number in this building');
    }

    const unit = this.unitRepository.create(createUnitDto);
    const savedUnit = await this.unitRepository.save(unit);

    await this.cache.invalidatePattern(CACHE_KEYS.unitListPattern());

    this.logger.log(`Unit created: ${savedUnit.id}`, UnitsService.name, {
      unitId: savedUnit.id,
      buildingId: createUnitDto.buildingId,
    });

    return savedUnit;
  }

  async findAllByBuilding(
    buildingId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Unit[]; total: number }> {
    // Verify building exists
    await this.buildingsService.findOne(buildingId);

    const { page = 1, limit = 10, includeDeleted = false } = pagination;
    const cacheKey = CACHE_KEYS.unitsByBuilding(buildingId, page, limit);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.unitRepository
          .createQueryBuilder('unit')
          .where('unit.building_id = :buildingId', { buildingId })
          .orderBy('unit.floor', 'ASC')
          .addOrderBy('unit.number', 'ASC')
          .skip((page - 1) * limit)
          .take(limit);

        if (includeDeleted) {
          queryBuilder.withDeleted();
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
      },
      CACHE_TTL.UNIT_LIST,
    );
  }

  async findOne(id: string, includeDeleted = false): Promise<Unit> {
    if (includeDeleted) {
      const unit = await SoftDeleteRepositoryHelper.findOneById(
        this.unitRepository,
        id,
        { includeDeleted },
      );

      if (!unit) {
        throw new NotFoundException('Unit');
      }

      return unit;
    }

    const cacheKey = CACHE_KEYS.unit(id);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const unit = await SoftDeleteRepositoryHelper.findOneById(
          this.unitRepository,
          id,
          { includeDeleted: false },
        );

        if (!unit) {
          throw new NotFoundException('Unit');
        }

        return unit;
      },
      CACHE_TTL.UNIT,
    );
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);

    // Check for unique number if number is being updated
    if (updateUnitDto.number && updateUnitDto.number !== unit.number) {
      const existingUnit = await this.unitRepository.findOne({
        where: {
          buildingId: unit.buildingId,
          number: updateUnitDto.number,
        },
      });

      if (existingUnit) {
        throw new AlreadyExistsException('Unit number in this building');
      }
    }

    Object.assign(unit, updateUnitDto);
    const updatedUnit = await this.unitRepository.save(unit);

    await this.invalidateUnitCache(updatedUnit.id);

    this.logger.log(`Unit updated: ${id}`, UnitsService.name, {
      unitId: id,
    });

    return updatedUnit;
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await SoftDeleteRepositoryHelper.softDeleteEntity(this.unitRepository, unit);

    await this.invalidateUnitCache(id);

    this.logger.log(`Unit soft deleted: ${id}`, UnitsService.name, {
      unitId: id,
    });
  }

  private async invalidateUnitCache(id: string): Promise<void> {
    await Promise.all([
      this.cache.invalidate(CACHE_KEYS.unit(id)),
      this.cache.invalidatePattern(CACHE_KEYS.unitListPattern()),
    ]);
  }
}
