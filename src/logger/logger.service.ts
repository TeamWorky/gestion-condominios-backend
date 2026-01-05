import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

/**
 * Custom logger service that wraps Winston logger
 * Provides NestJS-compatible interface
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  log(message: string, context?: string, metadata?: any): void {
    this.logger.info(message, { context, ...metadata });
  }

  error(message: string, trace?: string, context?: string, metadata?: any): void {
    this.logger.error(message, {
      context,
      stack: trace,
      ...metadata,
    });
  }

  warn(message: string, context?: string, metadata?: any): void {
    this.logger.warn(message, { context, ...metadata });
  }

  debug(message: string, context?: string, metadata?: any): void {
    this.logger.debug(message, { context, ...metadata });
  }

  verbose(message: string, context?: string, metadata?: any): void {
    this.logger.verbose(message, { context, ...metadata });
  }

  /**
   * Logs with custom level and metadata
   */
  logWithMetadata(
    level: 'info' | 'warn' | 'error' | 'debug' | 'verbose',
    message: string,
    metadata?: any,
  ): void {
    this.logger[level](message, metadata);
  }
}
