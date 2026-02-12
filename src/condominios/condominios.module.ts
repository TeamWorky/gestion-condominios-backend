import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Condominio } from './entities/condominio.entity';
import { Building } from '../buildings/entities/building.entity';
import { Unit } from '../units/entities/unit.entity';
import { Resident } from '../residents/entities/resident.entity';
import { CommonSpace } from '../common-spaces/entities/common-space.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CommonExpense } from '../payments/entities/common-expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Condominio,
      Building,
      Unit,
      Resident,
      CommonSpace,
      Reservation,
      Payment,
      CommonExpense,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CondominiosModule {}
