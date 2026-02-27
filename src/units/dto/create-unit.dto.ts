import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsEnum,
  Min,
  Max,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType } from '../../common/enums/unit-type.enum';
import { UnitStatus } from '../../common/enums/unit-status.enum';

export class CreateUnitDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Building ID' })
  @IsUUID()
  @IsNotEmpty()
  buildingId: string;

  @ApiProperty({ example: '101', description: 'Unit number (unique within building)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  number: string;

  @ApiPropertyOptional({ example: 1, description: 'Floor number' })
  @IsInt()
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ example: 'A', description: 'Block or section' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  block?: string;

  @ApiPropertyOptional({ enum: UnitType, example: UnitType.APARTMENT, description: 'Type of unit' })
  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  @ApiPropertyOptional({ example: 85.5, description: 'Area in square meters' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  areaM2?: number;

  @ApiPropertyOptional({ example: 0.0125, description: 'Aliquot percentage (0-1)' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  @IsOptional()
  aliquot?: number;

  @ApiPropertyOptional({ example: 3, description: 'Number of bedrooms' })
  @IsInt()
  @Min(0)
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of bathrooms' })
  @IsInt()
  @Min(0)
  @IsOptional()
  bathrooms?: number;

  @ApiPropertyOptional({ example: 1, description: 'Number of parking spots', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  parkingSpots?: number;

  @ApiPropertyOptional({ example: 1, description: 'Number of storage units', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  storageUnits?: number;

  @ApiPropertyOptional({ enum: UnitStatus, example: UnitStatus.AVAILABLE, description: 'Unit status' })
  @IsEnum(UnitStatus)
  @IsOptional()
  status?: UnitStatus;

  @ApiPropertyOptional({ example: false, description: 'Is unit occupied', default: false })
  @IsBoolean()
  @IsOptional()
  isOccupied?: boolean;
}
