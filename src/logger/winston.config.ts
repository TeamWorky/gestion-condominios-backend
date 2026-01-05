import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from './entities/log.entity';

/**
 * Creates Winston logger configuration
 */
export const createWinstonConfig = (
  configService: ConfigService,
  databaseTransport?: any,
) => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const logLevel = configService.get<string>('LOG_LEVEL') || 'info';
  const dbLogLevel = configService.get<string>('LOG_DB_LEVEL') || 'error';

  const transports: winston.transport[] = [];

  // Console transport for development
  if (nodeEnv === 'development') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            const contextStr = context ? `[${context}]` : '';
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
          }),
        ),
      }),
    );
  } else {
    // Production: simple console format
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  // Database transport if provided
  // Capture from configured DB level (default: error) to ensure all errors are saved
  if (databaseTransport) {
    transports.push(
      new winston.transports.Stream({
        stream: databaseTransport,
        format: winston.format.json(),
        level: dbLogLevel, // Capture from this level up (error, warn, info, etc.)
      }),
    );
  }

  return {
    level: logLevel, // Console level (can be filtered)
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports,
    // Handle uncaught exceptions - always log to database
    exceptionHandlers: transports,
    // Handle unhandled promise rejections - always log to database
    rejectionHandlers: transports,
  };
};
