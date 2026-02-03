import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Condominium ID' })
  @IsUUID()
  @IsNotEmpty()
  condominiumId: string;

  @ApiProperty({ example: 'Torre A', description: 'Building name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'TA', description: 'Building code (unique within condominium)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 10, description: 'Number of floors', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  floors?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of underground floors', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  undergroundFloors?: number;

  @ApiPropertyOptional({ example: true, description: 'Has elevator', default: false })
  @IsBoolean()
  @IsOptional()
  hasElevator?: boolean;

  @ApiPropertyOptional({ example: 'Entrada por calle principal', description: 'Building address' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: true, description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
