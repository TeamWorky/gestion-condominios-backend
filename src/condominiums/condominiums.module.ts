import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CondominiumsController } from './condominiums.controller';
import { CondominiumsService } from './condominiums.service';
import { Condominium } from './entities/condominium.entity';
import { Building } from '../buildings/entities/building.entity';
import { Unit } from '../units/entities/unit.entity';
import { CondominiumSeeder } from '../database/seeders/condominium.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Condominium, Building, Unit])],
  controllers: [CondominiumsController],
  providers: [CondominiumsService, CondominiumSeeder],
  exports: [CondominiumsService],
})
export class CondominiumsModule {}
