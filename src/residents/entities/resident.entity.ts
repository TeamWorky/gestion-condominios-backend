import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Unit } from '../../units/entities/unit.entity';
import { User } from '../../users/entities/user.entity';
import { ResidentType } from '../../common/enums/resident-type.enum';

@Entity('residents')
export class Resident extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', name: 'unit_id' })
  unitId: string;

  @ManyToOne(() => Unit, (unit) => unit.residents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({
    type: 'enum',
    enum: ResidentType,
    name: 'resident_type',
    default: ResidentType.TENANT,
  })
  residentType: ResidentType;

  @Column({ type: 'date', name: 'move_in_date', nullable: true })
  moveInDate?: Date;

  @Column({ type: 'date', name: 'move_out_date', nullable: true })
  moveOutDate?: Date;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relationship?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;
}
