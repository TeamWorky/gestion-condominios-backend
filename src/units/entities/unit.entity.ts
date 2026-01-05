import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Building } from '../../buildings/entities/building.entity';
import { Resident } from '../../residents/entities/resident.entity';
import { UnitStatus } from '../../common/enums/unit-status.enum';
import { Payment } from '../../payments/entities/payment.entity';

/**
 * Entidad Unit (Unidad/Departamento)
 * Representa una unidad dentro de un edificio
 */
@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  unitNumber: string;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  block: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area: number;

  @Column({ type: 'int', nullable: true })
  bedrooms: number;

  @Column({ type: 'int', nullable: true })
  bathrooms: number;

  @Column({ type: 'int', default: 0 })
  parkingSpots: number;

  @Column({ type: 'int', default: 0 })
  storageUnits: number;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.DISPONIBLE,
  })
  status: UnitStatus;

  @Column({ type: 'boolean', default: false })
  isOccupied: boolean;

  // Relación con Building
  @ManyToOne(() => Building, (building) => building.units, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({ type: 'uuid' })
  buildingId: string;

  // Residente actual
  @ManyToOne(() => Resident, { nullable: true })
  @JoinColumn({ name: 'currentResidentId' })
  currentResident: Resident;

  @Column({ type: 'uuid', nullable: true })
  currentResidentId: string;

  // Relaciones
  @OneToMany(() => Resident, (resident) => resident.unit)
  residents: Resident[];

  @OneToMany(() => Payment, (payment) => payment.unit)
  payments: Payment[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
