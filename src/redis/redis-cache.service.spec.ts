import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';
import { LoggerService } from '../logger/logger.service';
import Redis from 'ioredis';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let redisClient: jest.Mocked<Redis>;
  let logger: jest.Mocked<LoggerService>;

  const mockRedisClient = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    ttl: jest.fn(),
    expire: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
    logWithMetadata: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
    redisClient = module.get('REDIS_CLIENT');
    logger = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return parsed value from cache', async () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1, name: 'Test' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toEqual(value);
      expect(redisClient.get).toHaveBeenCalledWith(key);
    });

    it('should return null when key does not exist', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockRedisClient.get.mockResolvedValue(null);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null and log warning on error', async () => {
      // Arrange
      const key = 'test-key';
      const error = new Error('Redis error');
      mockRedisClient.get.mockRejectedValue(error);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to get cache key: ${key}`,
        RedisCacheService.name,
        expect.objectContaining({ key, error: error.message }),
      );
    });
  });

  describe('set', () => {
    it('should set value in cache with TTL', async () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1, name: 'Test' };
      const ttl = 300;

      // Act
      await service.set(key, value, ttl);

      // Assert
      expect(redisClient.setex).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(value),
      );
    });

    it('should log warning on error', async () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1 };
      const ttl = 300;
      const error = new Error('Redis error');
      mockRedisClient.setex.mockRejectedValue(error);

      // Act
      await service.set(key, value, ttl);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to set cache key: ${key}`,
        RedisCacheService.name,
        expect.objectContaining({ key, error: error.message }),
      );
    });
  });

  describe('delete', () => {
    it('should delete cache key', async () => {
      // Arrange
      const key = 'test-key';

      // Act
      await service.delete(key);

      // Assert
      expect(redisClient.del).toHaveBeenCalledWith(key);
    });

    it('should log warning on error', async () => {
      // Arrange
      const key = 'test-key';
      const error = new Error('Redis error');
      mockRedisClient.del.mockRejectedValue(error);

      // Act
      await service.delete(key);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to delete cache key: ${key}`,
        RedisCacheService.name,
        expect.objectContaining({ key, error: error.message }),
      );
    });
  });

  describe('deletePattern', () => {
    it('should delete all keys matching pattern', async () => {
      // Arrange
      const pattern = 'users:*';
      const keys = ['users:1', 'users:2', 'users:3'];
      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(3);

      // Act
      await service.deletePattern(pattern);

      // Assert
      expect(redisClient.keys).toHaveBeenCalledWith(pattern);
      expect(redisClient.del).toHaveBeenCalledWith(...keys);
      expect(logger.debug).toHaveBeenCalledWith(
        `Deleted ${keys.length} cache keys matching pattern: ${pattern}`,
        RedisCacheService.name,
        expect.objectContaining({ pattern, count: keys.length }),
      );
    });

    it('should not delete anything when no keys match', async () => {
      // Arrange
      const pattern = 'users:*';
      mockRedisClient.keys.mockResolvedValue([]);

      // Act
      await service.deletePattern(pattern);

      // Assert
      expect(redisClient.del).not.toHaveBeenCalled();
    });

    it('should log warning on error', async () => {
      // Arrange
      const pattern = 'users:*';
      const error = new Error('Redis error');
      mockRedisClient.keys.mockRejectedValue(error);

      // Act
      await service.deletePattern(pattern);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to delete cache pattern: ${pattern}`,
        RedisCacheService.name,
        expect.objectContaining({ pattern, error: error.message }),
      );
    });
  });

  describe('getOrSet', () => {
    it('should return cached value when available', async () => {
      // Arrange
      const key = 'test-key';
      const cachedValue = { id: 1, name: 'Cached' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedValue));
      const fetchFn = jest.fn();

      // Act
      const result = await service.getOrSet(key, fetchFn, 300);

      // Assert
      expect(result).toEqual(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache value when not in cache', async () => {
      // Arrange
      const key = 'test-key';
      const fetchedValue = { id: 1, name: 'Fetched' };
      mockRedisClient.get.mockResolvedValue(null);
      const fetchFn = jest.fn().mockResolvedValue(fetchedValue);
      mockRedisClient.setex.mockResolvedValue('OK');

      // Act
      const result = await service.getOrSet(key, fetchFn, 300);

      // Assert
      expect(result).toEqual(fetchedValue);
      expect(fetchFn).toHaveBeenCalled();
      expect(redisClient.setex).toHaveBeenCalledWith(
        key,
        300,
        JSON.stringify(fetchedValue),
      );
    });

    it('should use default TTL when not provided', async () => {
      // Arrange
      const key = 'test-key';
      const fetchedValue = { id: 1 };
      mockRedisClient.get.mockResolvedValue(null);
      const fetchFn = jest.fn().mockResolvedValue(fetchedValue);

      // Act
      await service.getOrSet(key, fetchFn);

      // Assert
      expect(redisClient.setex).toHaveBeenCalledWith(
        key,
        300, // default TTL
        JSON.stringify(fetchedValue),
      );
    });
  });

  describe('invalidate', () => {
    it('should call delete method', async () => {
      // Arrange
      const key = 'test-key';
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      // Act
      await service.invalidate(key);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(key);
    });
  });

  describe('invalidatePattern', () => {
    it('should call deletePattern method', async () => {
      // Arrange
      const pattern = 'users:*';
      jest.spyOn(service, 'deletePattern').mockResolvedValue(undefined);

      // Act
      await service.invalidatePattern(pattern);

      // Assert
      expect(service.deletePattern).toHaveBeenCalledWith(pattern);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      // Arrange
      const key = 'test-key';
      mockRedisClient.exists.mockResolvedValue(1);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(true);
      expect(redisClient.exists).toHaveBeenCalledWith(key);
    });

    it('should return false when key does not exist', async () => {
      // Arrange
      const key = 'test-key';
      mockRedisClient.exists.mockResolvedValue(0);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false and log warning on error', async () => {
      // Arrange
      const key = 'test-key';
      const error = new Error('Redis error');
      mockRedisClient.exists.mockRejectedValue(error);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('getTTL', () => {
    it('should return TTL in seconds', async () => {
      // Arrange
      const key = 'test-key';
      const ttl = 300;
      mockRedisClient.ttl.mockResolvedValue(ttl);

      // Act
      const result = await service.getTTL(key);

      // Assert
      expect(result).toBe(ttl);
      expect(redisClient.ttl).toHaveBeenCalledWith(key);
    });

    it('should return -1 and log warning on error', async () => {
      // Arrange
      const key = 'test-key';
      const error = new Error('Redis error');
      mockRedisClient.ttl.mockRejectedValue(error);

      // Act
      const result = await service.getTTL(key);

      // Assert
      expect(result).toBe(-1);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('extendTTL', () => {
    it('should extend TTL of key', async () => {
      // Arrange
      const key = 'test-key';
      const additionalSeconds = 300;
      mockRedisClient.expire.mockResolvedValue(1);

      // Act
      await service.extendTTL(key, additionalSeconds);

      // Assert
      expect(redisClient.expire).toHaveBeenCalledWith(key, additionalSeconds);
    });

    it('should log warning on error', async () => {
      // Arrange
      const key = 'test-key';
      const additionalSeconds = 300;
      const error = new Error('Redis error');
      mockRedisClient.expire.mockRejectedValue(error);

      // Act
      await service.extendTTL(key, additionalSeconds);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to extend TTL for key: ${key}`,
        RedisCacheService.name,
        expect.objectContaining({ key, error: error.message }),
      );
    });
  });
});
