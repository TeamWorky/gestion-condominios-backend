import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCondominiumDto {
  @ApiProperty({ example: 'Condominio Las Palmas', description: 'Condominium name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Condominio Las Palmas SpA', description: 'Legal name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({ example: '76.123.456-7', description: 'RUT (Chilean tax ID)' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  rut?: string;

  @ApiProperty({ example: 'Av. Las Condes 1234', description: 'Address' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string;

  @ApiProperty({ example: 'Santiago', description: 'City' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Región Metropolitana', description: 'Region' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  region: string;

  @ApiPropertyOptional({ example: '7550000', description: 'Postal code' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'contacto@laspalmas.cl', description: 'Email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'Logo URL' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: { currency: 'CLP', timezone: 'America/Santiago' }, description: 'Settings' })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ example: true, description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
