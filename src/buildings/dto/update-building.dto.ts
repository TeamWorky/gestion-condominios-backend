import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBuildingDto } from './create-building.dto';

export class UpdateBuildingDto extends PartialType(
  OmitType(CreateBuildingDto, ['condominiumId'] as const),
) {}
