import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectCondominioDto {
  @ApiProperty({
    example: '4b7bdcca-c9c3-439a-8c86-214384b2e815',
    description: 'ID del condominio a seleccionar',
  })
  @IsNotEmpty()
  @IsUUID()
  condominioId: string;
}
