import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Building } from '../../buildings/entities/building.entity';
import { Resident } from '../../residents/entities/resident.entity';
import { UnitType } from '../../common/enums/unit-type.enum';
import { UnitStatus } from '../../common/enums/unit-status.enum';

@Entity('units')
@Unique(['buildingId', 'number'])
export class Unit extends BaseEntity {
  @Column({ type: 'uuid', name: 'building_id' })
  buildingId: string;

  @ManyToOne(() => Building, (building) => building.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ type: 'varchar', length: 50 })
  number: string;

  @Column({ type: 'int', nullable: true })
  floor?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  block?: string;

  @Column({
    type: 'enum',
    enum: UnitType,
    name: 'unit_type',
    default: UnitType.APARTMENT,
  })
  unitType: UnitType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'area_m2', nullable: true })
  areaM2?: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  aliquot?: number;

  @Column({ type: 'int', nullable: true })
  bedrooms?: number;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.AVAILABLE,
  })
  status: UnitStatus;

  @Column({ type: 'boolean', name: 'is_occupied', default: false })
  isOccupied: boolean;

  @OneToMany(() => Resident, (resident) => resident.unit)
  residents: Resident[];
}
