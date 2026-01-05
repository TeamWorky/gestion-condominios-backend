import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { DatabaseTransport } from './transports/database.transport';
import { createWinstonConfig } from './winston.config';
import { LoggerService } from './logger.service';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { Repository } from 'typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Log]),
    WinstonModule.forRootAsync({
      imports: [ConfigModule, TypeOrmModule.forFeature([Log])],
      inject: [ConfigService, getRepositoryToken(Log)],
      useFactory: (
        configService: ConfigService,
        logRepository: Repository<Log>,
      ) => {
        const batchSize = configService.get<number>('LOG_BATCH_SIZE') || 10;
        const batchTimeout =
          configService.get<number>('LOG_BATCH_TIMEOUT') || 5000;
        const databaseTransport = new DatabaseTransport(
          logRepository,
          batchSize,
          batchTimeout,
        );
        return createWinstonConfig(configService, databaseTransport as any);
      },
    }),
  ],
  controllers: [LogsController],
  providers: [LoggerService, LogsService],
  exports: [LoggerService, WinstonModule],
})
export class LoggerModule {}
