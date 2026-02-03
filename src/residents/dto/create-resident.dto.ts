import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResidentType } from '../../common/enums/resident-type.enum';

export class CreateResidentDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'User ID (optional)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unit ID' })
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @ApiPropertyOptional({ enum: ResidentType, example: ResidentType.OWNER, description: 'Type of resident' })
  @IsEnum(ResidentType)
  @IsOptional()
  residentType?: ResidentType;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Move in date' })
  @IsDateString()
  @IsOptional()
  moveInDate?: string;

  @ApiPropertyOptional({ example: '2025-01-15', description: 'Move out date' })
  @IsDateString()
  @IsOptional()
  moveOutDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Is primary resident', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'Spouse', description: 'Relationship to primary resident' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({ example: true, description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
