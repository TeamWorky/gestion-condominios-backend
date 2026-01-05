import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerService } from '../logger/logger.service';

/**
 * Redis cache service with common caching patterns
 * Provides reusable methods for cache-aside pattern
 */
@Injectable()
export class RedisCacheService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to get cache key: ${key}`,
        RedisCacheService.name,
        { key, error: error.message },
      );
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(
        `Failed to set cache key: ${key}`,
        RedisCacheService.name,
        { key, error: error.message },
      );
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(
        `Failed to delete cache key: ${key}`,
        RedisCacheService.name,
        { key, error: error.message },
      );
    }
  }

  /**
   * Delete multiple cache keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(
          `Deleted ${keys.length} cache keys matching pattern: ${pattern}`,
          RedisCacheService.name,
          { pattern, count: keys.length },
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to delete cache pattern: ${pattern}`,
        RedisCacheService.name,
        { pattern, error: error.message },
      );
    }
  }

  /**
   * Cache-aside pattern: Get from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch from source
    const value = await fetchFn();

    // Store in cache
    await this.set(key, value, ttlSeconds);

    return value;
  }

  /**
   * Invalidate cache by key
   */
  async invalidate(key: string): Promise<void> {
    await this.delete(key);
  }

  /**
   * Invalidate cache by pattern (e.g., 'users:*')
   */
  async invalidatePattern(pattern: string): Promise<void> {
    await this.deletePattern(pattern);
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.warn(
        `Failed to check cache key existence: ${key}`,
        RedisCacheService.name,
        { key, error: error.message },
      );
      return false;
    }
  }

  /**
   * Get TTL (time to live) of a key in seconds
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.warn(
        `Failed to get TTL for key: ${key}`,
        RedisCacheService.name,
        { key, error: error.message },
      );
      return -1;
    }
  }

  /**
   * Extend TTL of a key
   */
  async extendTTL(key: string, additionalSeconds: number): Promise<void> {
    try {
      await this.redis.expire(key, additionalSeconds);
    } catch (error) {
      this.logger.warn(
        `Failed to extend TTL for key: ${key}`,
        RedisCacheService.name,
        { key, error: error.message },
      );
    }
  }
}
