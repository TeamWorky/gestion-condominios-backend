import * as winston from 'winston';
import { Repository } from 'typeorm';
import { Log, LogLevel } from '../entities/log.entity';
import { Transform } from 'stream';

/**
 * Custom Winston transport that writes logs to PostgreSQL database
 * Uses batch inserts for better performance
 */
export class DatabaseTransport extends Transform {
  private logBuffer: Array<{
    level: string;
    message: string;
    context?: string;
    requestId?: string;
    metadata?: any;
    stack?: string;
  }> = [];

  private batchSize: number;
  private batchTimeout: number;
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private readonly logRepository: Repository<Log>,
    batchSize: number = 10,
    batchTimeout: number = 5000,
  ) {
    super({ objectMode: true });
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
  }

  /**
   * Transform stream method - called by Winston
   */
  _transform(chunk: any, encoding: string, callback: () => void): void {
    this.addToBuffer(chunk);
    callback();
  }

  /**
   * Adds log to buffer and flushes if needed
   */
  private addToBuffer(logData: {
    level: string;
    message?: string;
    msg?: string;
    context?: string;
    requestId?: string;
    metadata?: any;
    stack?: string;
    [key: string]: any;
  }): void {
    // Extract metadata (all fields except level, message, context, requestId, stack, timestamp)
    const { level, message, msg, context, requestId, stack, timestamp, ...rest } = logData;
    const metadata = Object.keys(rest).length > 0 ? rest : undefined;

    this.logBuffer.push({
      level: this.normalizeLevel(logData.level),
      message: logData.message || logData.msg || String(logData) || '',
      context: logData.context,
      requestId: logData.requestId,
      metadata,
      stack: logData.stack,
    });

    // Flush if buffer is full
    if (this.logBuffer.length >= this.batchSize) {
      this.flush();
    } else {
      // Set timeout to flush after batchTimeout
      this.resetFlushTimer();
    }
  }

  /**
   * Flushes buffered logs to database
   */
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToInsert = [...this.logBuffer];
    this.logBuffer = [];
    this.clearFlushTimer();

    try {
      // Insert logs in batch
      const logEntities = logsToInsert.map((log) => {
        const entity = new Log();
        entity.level = log.level as LogLevel;
        entity.message = log.message;
        entity.context = log.context;
        entity.requestId = log.requestId;
        entity.metadata = log.metadata;
        entity.stack = log.stack;
        return entity;
      });

      await this.logRepository.save(logEntities);
    } catch (error) {
      // Fallback: log to console if database write fails
      console.error('Failed to write logs to database:', error);
    }
  }

  /**
   * Normalizes log level to enum value
   */
  private normalizeLevel(level: string): LogLevel {
    const upperLevel = level.toLowerCase();
    if (Object.values(LogLevel).includes(upperLevel as LogLevel)) {
      return upperLevel as LogLevel;
    }
    return LogLevel.INFO;
  }

  /**
   * Resets the flush timer
   */
  private resetFlushTimer(): void {
    this.clearFlushTimer();
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.batchTimeout);
  }

  /**
   * Clears the flush timer
   */
  private clearFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Flushes remaining logs (called on shutdown)
   */
  _final(callback: () => void): void {
    this.clearFlushTimer();
    this.flush().then(() => callback()).catch(() => callback());
  }
}
