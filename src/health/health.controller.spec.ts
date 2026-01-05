import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let dataSource: jest.Mocked<DataSource>;
  let redis: jest.Mocked<Redis>;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockDataSource = {
    isInitialized: true,
  };

  const mockRedis = {
    ping: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedis,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    dataSource = module.get(DataSource);
    redis = module.get('REDIS_CLIENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return health status with all services up', async () => {
      // Arrange
      const expectedResult = {
        status: 'ok',
        info: {
          database: {
            status: 'up',
            message: 'Database is connected',
          },
          redis: {
            status: 'up',
            message: 'Redis is connected',
          },
        },
      };

      mockDataSource.isInitialized = true;
      mockRedis.ping.mockResolvedValue('PONG');
      mockHealthCheckService.check.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHealthCheckService.check).toHaveBeenCalled();
    });

    it('should return health status with database down', async () => {
      // Arrange
      const expectedResult = {
        status: 'error',
        error: {
          database: {
            status: 'down',
            message: 'Database is disconnected',
          },
        },
      };

      mockDataSource.isInitialized = false;
      mockHealthCheckService.check.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHealthCheckService.check).toHaveBeenCalled();
    });

    it('should return health status with redis down', async () => {
      // Arrange
      const expectedResult = {
        status: 'error',
        error: {
          redis: {
            status: 'down',
            message: 'Redis is disconnected',
          },
        },
      };

      mockDataSource.isInitialized = true;
      const redisError = new Error('Connection failed');
      mockRedis.ping.mockRejectedValue(redisError);
      mockHealthCheckService.check.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHealthCheckService.check).toHaveBeenCalled();
    });

    it('should call health check with correct health indicators', async () => {
      // Arrange
      mockDataSource.isInitialized = true;
      mockRedis.ping.mockResolvedValue('PONG');
      mockHealthCheckService.check.mockResolvedValue({ status: 'ok' } as any);

      // Act
      await controller.check();

      // Assert
      expect(mockHealthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // Database check function
          expect.any(Function), // Redis check function
        ]),
      );
    });

    it('should handle database check function correctly', async () => {
      // Arrange
      mockDataSource.isInitialized = true;
      mockRedis.ping.mockResolvedValue('PONG');

      let databaseCheckFunction: () => any;
      mockHealthCheckService.check.mockImplementation((checks) => {
        databaseCheckFunction = checks[0];
        return Promise.resolve({ status: 'ok' });
      });

      // Act
      await controller.check();
      const dbResult = databaseCheckFunction();

      // Assert
      expect(dbResult).toEqual({
        database: {
          status: 'up',
          message: 'Database is connected',
        },
      });
    });

    it('should handle database check function when disconnected', async () => {
      // Arrange
      mockDataSource.isInitialized = false;
      mockRedis.ping.mockResolvedValue('PONG');

      let databaseCheckFunction: () => any;
      mockHealthCheckService.check.mockImplementation((checks) => {
        databaseCheckFunction = checks[0];
        return Promise.resolve({ status: 'error' });
      });

      // Act
      await controller.check();
      const dbResult = databaseCheckFunction();

      // Assert
      expect(dbResult).toEqual({
        database: {
          status: 'down',
          message: 'Database is disconnected',
        },
      });
    });

    it('should handle redis check function correctly', async () => {
      // Arrange
      mockDataSource.isInitialized = true;
      mockRedis.ping.mockResolvedValue('PONG');

      let redisCheckFunction: () => Promise<any>;
      mockHealthCheckService.check.mockImplementation((checks) => {
        redisCheckFunction = checks[1];
        return Promise.resolve({ status: 'ok' });
      });

      // Act
      await controller.check();
      const redisResult = await redisCheckFunction();

      // Assert
      expect(redisResult).toEqual({
        redis: {
          status: 'up',
          message: 'Redis is connected',
        },
      });
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should handle redis check function when connection fails', async () => {
      // Arrange
      mockDataSource.isInitialized = true;
      const redisError = new Error('Connection timeout');
      mockRedis.ping.mockRejectedValue(redisError);

      let redisCheckFunction: () => Promise<any>;
      mockHealthCheckService.check.mockImplementation((checks) => {
        redisCheckFunction = checks[1];
        return Promise.resolve({ status: 'error' });
      });

      // Act
      await controller.check();
      const redisResult = await redisCheckFunction();

      // Assert
      expect(redisResult).toEqual({
        redis: {
          status: 'down',
          message: 'Redis is disconnected',
        },
      });
    });
  });
});
