import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Log } from './entities/log.entity';
import { FilterLogsDto, LogLevel } from './dto/filter-logs.dto';
import { LoggerService } from './logger.service';
import { NotFoundException } from '../common/exceptions/business.exception';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly logger: LoggerService,
  ) {}

  async findAll(filterDto: FilterLogsDto): Promise<{ data: Log[]; total: number }> {
    const { page = 1, limit = 10, level, context, requestId, search } = filterDto;

    const where: FindOptionsWhere<Log> = {};

    if (level) {
      where.level = level;
    }

    if (context) {
      where.context = context;
    }

    if (requestId) {
      where.requestId = requestId;
    }

    const [data, total] = await this.logRepository.findAndCount({
      where: search
        ? [
            { ...where, message: Like(`%${search}%`) },
            { ...where, context: Like(`%${search}%`) },
          ]
        : where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Log> {
    const log = await this.logRepository.findOne({ where: { id } });

    if (!log) {
      throw new NotFoundException('Log');
    }

    return log;
  }

  async findByRequestId(requestId: string): Promise<Log[]> {
    return this.logRepository.find({
      where: { requestId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByLevel(level: LogLevel, limit = 100): Promise<Log[]> {
    return this.logRepository.find({
      where: { level },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getContexts(): Promise<string[]> {
    const logs = await this.logRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.context', 'context')
      .where('log.context IS NOT NULL')
      .getRawMany();

    return logs.map((log) => log.context).filter(Boolean);
  }

  async getStats(): Promise<{
    total: number;
    byLevel: Record<LogLevel, number>;
    byContext: Record<string, number>;
  }> {
    const total = await this.logRepository.count();

    const byLevel = await this.logRepository
      .createQueryBuilder('log')
      .select('log.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.level')
      .getRawMany();

    const byContext = await this.logRepository
      .createQueryBuilder('log')
      .select('log.context', 'context')
      .addSelect('COUNT(*)', 'count')
      .where('log.context IS NOT NULL')
      .groupBy('log.context')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const levelStats: Record<LogLevel, number> = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.DEBUG]: 0,
      [LogLevel.VERBOSE]: 0,
    };

    byLevel.forEach((item) => {
      levelStats[item.level as LogLevel] = parseInt(item.count, 10);
    });

    const contextStats: Record<string, number> = {};
    byContext.forEach((item) => {
      contextStats[item.context] = parseInt(item.count, 10);
    });

    return {
      total,
      byLevel: levelStats,
      byContext: contextStats,
    };
  }
}
