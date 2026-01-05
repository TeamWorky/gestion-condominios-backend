import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Entity('logs')
@Index(['level'])
@Index(['context'])
@Index(['requestId'])
@Index(['createdAt'])
export class Log extends BaseEntity {
  @Column({ type: 'varchar', length: 20 })
  level: LogLevel;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  context?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'request_id' })
  requestId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'text', nullable: true })
  stack?: string;
}
