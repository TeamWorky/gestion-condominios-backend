import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Condominium } from './entities/condominium.entity';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotFoundException } from '../common/exceptions/business.exception';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';

const CACHE_TTL = {
  CONDOMINIUM: 300,
  CONDOMINIUM_LIST: 60,
};

const CACHE_KEYS = {
  condominium: (id: string) => `condominium:${id}`,
  condominiumList: (page: number, limit: number, includeDeleted: boolean) =>
    `condominiums:list:${page}:${limit}:${includeDeleted}`,
  condominiumListPattern: () => 'condominiums:list:*',
};

@Injectable()
export class CondominiumsService {
  constructor(
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createCondominiumDto: CreateCondominiumDto): Promise<Condominium> {
    const condominium = this.condominiumRepository.create(createCondominiumDto);
    const savedCondominium = await this.condominiumRepository.save(condominium);

    await this.cache.invalidatePattern(CACHE_KEYS.condominiumListPattern());

    this.logger.log(`Condominium created: ${savedCondominium.id}`, CondominiumsService.name, {
      condominiumId: savedCondominium.id,
    });

    return savedCondominium;
  }

  async findAll(pagination: PaginationDto): Promise<{ data: Condominium[]; total: number }> {
    const { page = 1, limit = 10, includeDeleted = false } = pagination;
    const cacheKey = CACHE_KEYS.condominiumList(page, limit, includeDeleted);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await SoftDeleteRepositoryHelper.findAll(
          this.condominiumRepository,
          {
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
            includeDeleted,
          },
        );

        return { data, total };
      },
      CACHE_TTL.CONDOMINIUM_LIST,
    );
  }

  async findOne(id: string, includeDeleted = false): Promise<Condominium> {
    if (includeDeleted) {
      const condominium = await SoftDeleteRepositoryHelper.findOneById(
        this.condominiumRepository,
        id,
        { includeDeleted },
      );

      if (!condominium) {
        throw new NotFoundException('Condominium');
      }

      return condominium;
    }

    const cacheKey = CACHE_KEYS.condominium(id);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const condominium = await SoftDeleteRepositoryHelper.findOneById(
          this.condominiumRepository,
          id,
          { includeDeleted: false },
        );

        if (!condominium) {
          throw new NotFoundException('Condominium');
        }

        return condominium;
      },
      CACHE_TTL.CONDOMINIUM,
    );
  }

  async update(id: string, updateCondominiumDto: UpdateCondominiumDto): Promise<Condominium> {
    const condominium = await this.findOne(id);

    Object.assign(condominium, updateCondominiumDto);
    const updatedCondominium = await this.condominiumRepository.save(condominium);

    await this.invalidateCondominiumCache(updatedCondominium.id);

    this.logger.log(`Condominium updated: ${id}`, CondominiumsService.name, {
      condominiumId: id,
    });

    return updatedCondominium;
  }

  async remove(id: string): Promise<void> {
    const condominium = await this.findOne(id);
    await SoftDeleteRepositoryHelper.softDeleteEntity(this.condominiumRepository, condominium);

    await this.invalidateCondominiumCache(id);

    this.logger.log(`Condominium soft deleted: ${id}`, CondominiumsService.name, {
      condominiumId: id,
    });
  }

  async restore(id: string): Promise<Condominium> {
    const condominium = await this.findOne(id, true);

    if (!SoftDeleteRepositoryHelper.isDeleted(condominium)) {
      throw new NotFoundException('Condominium is not deleted');
    }

    const restoredCondominium = await SoftDeleteRepositoryHelper.restoreEntity(
      this.condominiumRepository,
      condominium,
    );

    await this.invalidateCondominiumCache(id);

    this.logger.log(`Condominium restored: ${id}`, CondominiumsService.name, {
      condominiumId: id,
    });

    return restoredCondominium;
  }

  private async invalidateCondominiumCache(id: string): Promise<void> {
    await Promise.all([
      this.cache.invalidate(CACHE_KEYS.condominium(id)),
      this.cache.invalidatePattern(CACHE_KEYS.condominiumListPattern()),
    ]);
  }
}
