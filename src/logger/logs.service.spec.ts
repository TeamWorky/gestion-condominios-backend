import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogsService } from './logs.service';
import { Log, LogLevel } from './entities/log.entity';
import { LoggerService } from './logger.service';
import { NotFoundException } from '../common/exceptions/business.exception';

describe('LogsService', () => {
  let service: LogsService;
  let repository: jest.Mocked<Repository<Log>>;
  let logger: jest.Mocked<LoggerService>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    logWithMetadata: jest.fn(),
  };

  const createMockLog = (overrides?: Partial<Log>): Log => {
    const log = new Log();
    log.id = overrides?.id || '123e4567-e89b-12d3-a456-426614174000';
    log.level = overrides?.level || LogLevel.INFO;
    log.message = overrides?.message || 'Test log message';
    log.context = overrides?.context || 'TestContext';
    log.requestId = overrides?.requestId || 'req-123';
    log.metadata = overrides?.metadata || null;
    log.stack = overrides?.stack || null;
    log.createdAt = overrides?.createdAt || new Date();
    log.updatedAt = overrides?.updatedAt || new Date();
    return Object.assign(log, overrides);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        {
          provide: getRepositoryToken(Log),
          useValue: mockRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
    repository = module.get(getRepositoryToken(Log));
    logger = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated logs', async () => {
      // Arrange
      const filterDto = { page: 1, limit: 10 };
      const logs = [createMockLog(), createMockLog()];
      const total = 2;

      mockRepository.findAndCount.mockResolvedValue([logs, total]);

      // Act
      const result = await service.findAll(filterDto);

      // Assert
      expect(result.data).toEqual(logs);
      expect(result.total).toBe(total);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter by level', async () => {
      // Arrange
      const filterDto = { page: 1, limit: 10, level: LogLevel.ERROR };
      const logs = [createMockLog({ level: LogLevel.ERROR })];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([logs, total]);

      // Act
      const result = await service.findAll(filterDto);

      // Assert
      expect(result.data).toEqual(logs);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { level: LogLevel.ERROR },
        }),
      );
    });

    it('should filter by context', async () => {
      // Arrange
      const filterDto = { page: 1, limit: 10, context: 'UsersService' };
      const logs = [createMockLog({ context: 'UsersService' })];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([logs, total]);

      // Act
      const result = await service.findAll(filterDto);

      // Assert
      expect(result.data).toEqual(logs);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { context: 'UsersService' },
        }),
      );
    });

    it('should filter by requestId', async () => {
      // Arrange
      const filterDto = { page: 1, limit: 10, requestId: 'req-123' };
      const logs = [createMockLog({ requestId: 'req-123' })];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([logs, total]);

      // Act
      const result = await service.findAll(filterDto);

      // Assert
      expect(result.data).toEqual(logs);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { requestId: 'req-123' },
        }),
      );
    });

    it('should search in message and context', async () => {
      // Arrange
      const filterDto = { page: 1, limit: 10, search: 'error' };
      const logs = [createMockLog({ message: 'Error occurred' })];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([logs, total]);

      // Act
      const result = await service.findAll(filterDto);

      // Assert
      expect(result.data).toEqual(logs);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return log by id', async () => {
      // Arrange
      const logId = 'log-id-123';
      const mockLog = createMockLog({ id: logId });

      mockRepository.findOne.mockResolvedValue(mockLog);

      // Act
      const result = await service.findOne(logId);

      // Assert
      expect(result).toEqual(mockLog);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: logId },
      });
    });

    it('should throw NotFoundException when log does not exist', async () => {
      // Arrange
      const logId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(logId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRequestId', () => {
    it('should return logs for a specific request ID', async () => {
      // Arrange
      const requestId = 'req-123';
      const logs = [
        createMockLog({ requestId, message: 'Log 1' }),
        createMockLog({ requestId, message: 'Log 2' }),
      ];

      mockRepository.find.mockResolvedValue(logs);

      // Act
      const result = await service.findByRequestId(requestId);

      // Assert
      expect(result).toEqual(logs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { requestId },
        order: { createdAt: 'ASC' },
      });
    });

    it('should return empty array when no logs found', async () => {
      // Arrange
      const requestId = 'non-existent-req';

      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByRequestId(requestId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByLevel', () => {
    it('should return logs filtered by level', async () => {
      // Arrange
      const level = LogLevel.ERROR;
      const logs = [
        createMockLog({ level: LogLevel.ERROR }),
        createMockLog({ level: LogLevel.ERROR }),
      ];

      mockRepository.find.mockResolvedValue(logs);

      // Act
      const result = await service.findByLevel(level);

      // Assert
      expect(result).toEqual(logs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { level },
        take: 100,
        order: { createdAt: 'DESC' },
      });
    });

    it('should respect limit parameter', async () => {
      // Arrange
      const level = LogLevel.ERROR;
      const limit = 50;
      const logs = [createMockLog({ level: LogLevel.ERROR })];

      mockRepository.find.mockResolvedValue(logs);

      // Act
      const result = await service.findByLevel(level, limit);

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { level },
        take: limit,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getContexts', () => {
    it('should return list of unique contexts', async () => {
      // Arrange
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { context: 'UsersService' },
          { context: 'AuthService' },
          { context: null }, // should be filtered out
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getContexts();

      // Assert
      expect(result).toContain('UsersService');
      expect(result).toContain('AuthService');
      expect(result.length).toBe(2);
    });

    it('should return empty array when no contexts exist', async () => {
      // Arrange
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getContexts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return statistics about logs', async () => {
      // Arrange
      const total = 100;

      const mockCountQueryBuilder = {
        count: jest.fn().mockResolvedValue(total),
      };

      const mockLevelQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { level: LogLevel.ERROR, count: '20' },
          { level: LogLevel.WARN, count: '30' },
          { level: LogLevel.INFO, count: '50' },
        ]),
      };

      const mockContextQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { context: 'UsersService', count: '40' },
          { context: 'AuthService', count: '60' },
        ]),
      };

      mockRepository.count = jest.fn().mockResolvedValue(total);
      mockRepository.createQueryBuilder
        .mockReturnValueOnce(mockLevelQueryBuilder as any)
        .mockReturnValueOnce(mockContextQueryBuilder as any);

      // Act
      const result = await service.getStats();

      // Assert
      expect(result.total).toBe(100);
      expect(result.byLevel[LogLevel.ERROR]).toBe(20);
      expect(result.byLevel[LogLevel.WARN]).toBe(30);
      expect(result.byLevel[LogLevel.INFO]).toBe(50);
      expect(result.byContext['UsersService']).toBe(40);
      expect(result.byContext['AuthService']).toBe(60);
    });

    it('should return zero counts for levels with no logs', async () => {
      // Arrange
      const mockLevelQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      const mockContextQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.count = jest.fn().mockResolvedValue(0);
      mockRepository.createQueryBuilder
        .mockReturnValueOnce(mockLevelQueryBuilder as any)
        .mockReturnValueOnce(mockContextQueryBuilder as any);

      // Act
      const result = await service.getStats();

      // Assert
      expect(result.total).toBe(0);
      expect(result.byLevel[LogLevel.ERROR]).toBe(0);
      expect(result.byLevel[LogLevel.WARN]).toBe(0);
      expect(result.byLevel[LogLevel.INFO]).toBe(0);
      expect(Object.keys(result.byContext).length).toBe(0);
    });
  });
});

