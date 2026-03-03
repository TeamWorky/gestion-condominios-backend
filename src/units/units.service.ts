import { Injectable, BadRequestException } from '@nestjs/common';
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
import { CondominiumsService } from '../condominiums/condominiums.service';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUUID(id: string): void {
  if (!id || id === 'null' || !UUID_REGEX.test(id)) {
    throw new BadRequestException('Invalid UUID format');
  }
}

const CACHE_TTL = {
  UNIT: 300,
  UNIT_LIST: 60,
};

const CACHE_KEYS = {
  unit: (id: string) => `unit:${id}`,
  unitsByBuilding: (buildingId: string, page: number, limit: number) =>
    `units:building:${buildingId}:${page}:${limit}`,
  unitsByCondominium: (condoId: string, page: number, limit: number) =>
    `units:condo:${condoId}:${page}:${limit}`,
  unitListPattern: () => 'units:*',
};

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly buildingsService: BuildingsService,
    private readonly condominiumsService: CondominiumsService,
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

  async findAllByCondominium(
    condoId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Unit[]; total: number }> {
    await this.condominiumsService.findOne(condoId);

    const { page = 1, limit = 10, includeDeleted = false } = pagination;
    const cacheKey = CACHE_KEYS.unitsByCondominium(condoId, page, limit);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.unitRepository
          .createQueryBuilder('unit')
          .innerJoinAndSelect('unit.building', 'building')
          .where('building.condominium_id = :condoId', { condoId })
          .orderBy('building.name', 'ASC')
          .addOrderBy('unit.floor', 'ASC')
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
    validateUUID(id);
    
    const cacheKey = CACHE_KEYS.unit(id);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.unitRepository
          .createQueryBuilder('unit')
          .innerJoinAndSelect('unit.building', 'building')
          .where('unit.id = :id', { id });

        if (includeDeleted) {
          queryBuilder.withDeleted();
        }

        const unit = await queryBuilder.getOne();

        if (!unit) {
          throw new NotFoundException('Unit');
        }

        return unit;
      },
      CACHE_TTL.UNIT,
    );
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    validateUUID(id);
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
    validateUUID(id);
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
