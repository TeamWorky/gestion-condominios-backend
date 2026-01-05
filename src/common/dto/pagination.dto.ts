import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
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

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Include soft deleted items', example: false, default: false })
  includeDeleted?: boolean = false;
}

