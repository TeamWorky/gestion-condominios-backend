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
import { CommonSpaceType } from '../../common/enums/common-space-type.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';

/**
 * Entidad CommonSpace (Espacio Común)
 * Representa un espacio común reservable en el condominio
 */
@Entity('common_spaces')
export class CommonSpace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: CommonSpaceType,
  })
  type: CommonSpaceType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area: number;

  @Column({ type: 'json', nullable: true })
  amenities: string[];

  @Column({ type: 'boolean', default: true })
  isReservable: boolean;

  @Column({ type: 'time', nullable: true })
  reservationStartTime: string;

  @Column({ type: 'time', nullable: true })
  reservationEndTime: string;

  @Column({ type: 'boolean', default: false })
  isExclusive: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relación con Building
  @ManyToOne(() => Building, (building) => building.commonSpaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column({ type: 'uuid' })
  buildingId: string;

  // Relaciones
  @OneToMany(() => Reservation, (reservation) => reservation.commonSpace)
  reservations: Reservation[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
