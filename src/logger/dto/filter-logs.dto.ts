import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export class FilterLogsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Items per page', example: 10, default: 10, maximum: 100 })
  limit?: number = 10;

  @IsEnum(LogLevel)
  @IsOptional()
  @ApiPropertyOptional({ 
    description: 'Filter by log level', 
    enum: LogLevel,
    example: LogLevel.ERROR 
  })
  level?: LogLevel;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Filter by context', example: 'UsersService' })
  context?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Filter by request ID', example: 'req-123' })
  requestId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Search in message', example: 'error' })
  search?: string;
}
