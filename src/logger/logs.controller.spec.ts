import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { FilterLogsDto, LogLevel } from './dto/filter-logs.dto';
import { Log } from './entities/log.entity';
import { ResponseUtil } from '../utils/response.util';
import { NotFoundException } from '../common/exceptions/business.exception';

describe('LogsController', () => {
  let controller: LogsController;
  let service: jest.Mocked<LogsService>;

  const mockLogsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRequestId: jest.fn(),
    findByLevel: jest.fn(),
    getStats: jest.fn(),
    getContexts: jest.fn(),
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
      controllers: [LogsController],
      providers: [
        {
          provide: LogsService,
          useValue: mockLogsService,
        },
      ],
    }).compile();

    controller = module.get<LogsController>(LogsController);
    service = module.get(LogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated logs', async () => {
      // Arrange
      const filterDto: FilterLogsDto = { page: 1, limit: 10 };
      const logs = [createMockLog(), createMockLog()];
      const total = 2;

      service.findAll.mockResolvedValue({ data: logs, total });

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(ResponseUtil.paginated(logs, 1, 10, total));
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const filterDto: FilterLogsDto = {};
      const logs = [createMockLog()];
      const total = 1;

      service.findAll.mockResolvedValue({ data: logs, total });

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(result).toEqual(ResponseUtil.paginated(logs, 1, 10, total));
    });

    it('should filter logs by level', async () => {
      // Arrange
      const filterDto: FilterLogsDto = {
        page: 1,
        limit: 10,
        level: LogLevel.ERROR,
      };
      const logs = [createMockLog({ level: LogLevel.ERROR })];
      const total = 1;

      service.findAll.mockResolvedValue({ data: logs, total });

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual(logs);
    });

    it('should filter logs by context', async () => {
      // Arrange
      const filterDto: FilterLogsDto = {
        page: 1,
        limit: 10,
        context: 'UsersService',
      };
      const logs = [createMockLog({ context: 'UsersService' })];
      const total = 1;

      service.findAll.mockResolvedValue({ data: logs, total });

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual(logs);
    });

    it('should filter logs by requestId', async () => {
      // Arrange
      const filterDto: FilterLogsDto = {
        page: 1,
        limit: 10,
        requestId: 'req-456',
      };
      const logs = [createMockLog({ requestId: 'req-456' })];
      const total = 1;

      service.findAll.mockResolvedValue({ data: logs, total });

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual(logs);
    });

    it('should search logs by search term', async () => {
      // Arrange
      const filterDto: FilterLogsDto = {
        page: 1,
        limit: 10,
        search: 'error',
      };
      const logs = [createMockLog({ message: 'Error occurred' })];
      const total = 1;

      service.findAll.mockResolvedValue({ data: logs, total });

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual(logs);
    });
  });

  describe('getStats', () => {
    it('should return log statistics', async () => {
      // Arrange
      const stats = {
        total: 100,
        byLevel: {
          [LogLevel.ERROR]: 20,
          [LogLevel.WARN]: 30,
          [LogLevel.INFO]: 50,
          [LogLevel.DEBUG]: 0,
          [LogLevel.VERBOSE]: 0,
        },
        byContext: {
          UsersService: 40,
          AuthService: 60,
        },
      };

      service.getStats.mockResolvedValue(stats);

      // Act
      const result = await controller.getStats();

      // Assert
      expect(service.getStats).toHaveBeenCalled();
      expect(result).toEqual(ResponseUtil.success(stats));
    });
  });

  describe('getContexts', () => {
    it('should return list of contexts', async () => {
      // Arrange
      const contexts = ['UsersService', 'AuthService', 'EmailService'];

      service.getContexts.mockResolvedValue(contexts);

      // Act
      const result = await controller.getContexts();

      // Assert
      expect(service.getContexts).toHaveBeenCalled();
      expect(result).toEqual(ResponseUtil.success(contexts));
    });

    it('should return empty array when no contexts exist', async () => {
      // Arrange
      service.getContexts.mockResolvedValue([]);

      // Act
      const result = await controller.getContexts();

      // Assert
      expect(result).toEqual(ResponseUtil.success([]));
    });
  });

  describe('findOne', () => {
    it('should return log by id', async () => {
      // Arrange
      const logId = 'log-id-123';
      const log = createMockLog({ id: logId });

      service.findOne.mockResolvedValue(log);

      // Act
      const result = await controller.findOne(logId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(logId);
      expect(result).toEqual(ResponseUtil.success(log));
    });

    it('should throw NotFoundException when log does not exist', async () => {
      // Arrange
      const logId = 'non-existent-id';

      service.findOne.mockRejectedValue(new NotFoundException('Log'));

      // Act & Assert
      await expect(controller.findOne(logId)).rejects.toThrow(
        NotFoundException,
      );
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

      service.findByRequestId.mockResolvedValue(logs);

      // Act
      const result = await controller.findByRequestId(requestId);

      // Assert
      expect(service.findByRequestId).toHaveBeenCalledWith(requestId);
      expect(result).toEqual(ResponseUtil.success(logs));
    });

    it('should return empty array when no logs found for request ID', async () => {
      // Arrange
      const requestId = 'non-existent-req';

      service.findByRequestId.mockResolvedValue([]);

      // Act
      const result = await controller.findByRequestId(requestId);

      // Assert
      expect(result).toEqual(ResponseUtil.success([]));
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

      service.findByLevel.mockResolvedValue(logs);

      // Act
      const result = await controller.findByLevel(level);

      // Assert
      expect(service.findByLevel).toHaveBeenCalledWith(level, undefined);
      expect(result).toEqual(ResponseUtil.success(logs));
    });

    it('should return logs filtered by level with limit', async () => {
      // Arrange
      const level = LogLevel.ERROR;
      const limit = 50;
      const logs = [createMockLog({ level: LogLevel.ERROR })];

      service.findByLevel.mockResolvedValue(logs);

      // Act
      const result = await controller.findByLevel(level, limit);

      // Assert
      expect(service.findByLevel).toHaveBeenCalledWith(level, limit);
      expect(result).toEqual(ResponseUtil.success(logs));
    });

    it('should handle all log levels', async () => {
      // Arrange
      const levels = [
        LogLevel.ERROR,
        LogLevel.WARN,
        LogLevel.INFO,
        LogLevel.DEBUG,
        LogLevel.VERBOSE,
      ];

      for (const level of levels) {
        const logs = [createMockLog({ level })];
        service.findByLevel.mockResolvedValue(logs);

        // Act
        const result = await controller.findByLevel(level);

        // Assert
        expect(result).toEqual(ResponseUtil.success(logs));
      }
    });
  });
});
