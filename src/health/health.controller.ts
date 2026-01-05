import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private readonly _health: HealthCheckService,
    @InjectDataSource() private readonly _dataSource: DataSource,
    @Inject('REDIS_CLIENT') private readonly _redis: Redis,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this._health.check([
      () => {
        const isConnected = this._dataSource.isInitialized;
        return {
          database: {
            status: isConnected ? 'up' : 'down',
            message: isConnected ? 'Database is connected' : 'Database is disconnected',
          },
        };
      },
      async () => {
        try {
          await this._redis.ping();
          return {
            redis: {
              status: 'up',
              message: 'Redis is connected',
            },
          };
        } catch (error) {
          return {
            redis: {
              status: 'down',
              message: 'Redis is disconnected',
            },
          };
        }
      },
    ]);
  }
}

