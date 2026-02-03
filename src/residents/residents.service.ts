import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from './entities/resident.entity';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotFoundException } from '../common/exceptions/business.exception';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { UnitsService } from '../units/units.service';

const CACHE_TTL = {
  RESIDENT: 300,
  RESIDENT_LIST: 60,
};

const CACHE_KEYS = {
  resident: (id: string) => `resident:${id}`,
  residentsByUnit: (unitId: string, page: number, limit: number) =>
    `residents:unit:${unitId}:${page}:${limit}`,
  residentListPattern: () => 'residents:*',
};

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentRepository: Repository<Resident>,
    private readonly unitsService: UnitsService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createResidentDto: CreateResidentDto): Promise<Resident> {
    // Verify unit exists
    await this.unitsService.findOne(createResidentDto.unitId);

    const resident = this.residentRepository.create(createResidentDto);
    const savedResident = await this.residentRepository.save(resident);

    await this.cache.invalidatePattern(CACHE_KEYS.residentListPattern());

    this.logger.log(`Resident created: ${savedResident.id}`, ResidentsService.name, {
      residentId: savedResident.id,
      unitId: createResidentDto.unitId,
    });

    return savedResident;
  }

  async findAllByUnit(
    unitId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Resident[]; total: number }> {
    // Verify unit exists
    await this.unitsService.findOne(unitId);

    const { page = 1, limit = 10, includeDeleted = false } = pagination;
    const cacheKey = CACHE_KEYS.residentsByUnit(unitId, page, limit);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.residentRepository
          .createQueryBuilder('resident')
          .leftJoinAndSelect('resident.user', 'user')
          .where('resident.unit_id = :unitId', { unitId })
          .orderBy('resident.is_primary', 'DESC')
          .addOrderBy('resident.created_at', 'ASC')
          .skip((page - 1) * limit)
          .take(limit);

        if (includeDeleted) {
          queryBuilder.withDeleted();
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
      },
      CACHE_TTL.RESIDENT_LIST,
    );
  }

  async findOne(id: string, includeDeleted = false): Promise<Resident> {
    if (includeDeleted) {
      const resident = await this.residentRepository.findOne({
        where: { id },
        relations: ['user'],
        withDeleted: true,
      });

      if (!resident) {
        throw new NotFoundException('Resident');
      }

      return resident;
    }

    const cacheKey = CACHE_KEYS.resident(id);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const resident = await this.residentRepository.findOne({
          where: { id },
          relations: ['user'],
        });

        if (!resident) {
          throw new NotFoundException('Resident');
        }

        return resident;
      },
      CACHE_TTL.RESIDENT,
    );
  }

  async update(id: string, updateResidentDto: UpdateResidentDto): Promise<Resident> {
    const resident = await this.findOne(id);

    Object.assign(resident, updateResidentDto);
    const updatedResident = await this.residentRepository.save(resident);

    await this.invalidateResidentCache(updatedResident.id);

    this.logger.log(`Resident updated: ${id}`, ResidentsService.name, {
      residentId: id,
    });

    return updatedResident;
  }

  async remove(id: string): Promise<void> {
    const resident = await this.findOne(id);
    await SoftDeleteRepositoryHelper.softDeleteEntity(this.residentRepository, resident);

    await this.invalidateResidentCache(id);

    this.logger.log(`Resident soft deleted: ${id}`, ResidentsService.name, {
      residentId: id,
    });
  }

  private async invalidateResidentCache(id: string): Promise<void> {
    await Promise.all([
      this.cache.invalidate(CACHE_KEYS.resident(id)),
      this.cache.invalidatePattern(CACHE_KEYS.residentListPattern()),
    ]);
  }
}
