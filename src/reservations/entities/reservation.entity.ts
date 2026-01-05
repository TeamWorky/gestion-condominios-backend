import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CommonSpace } from '../../common-spaces/entities/common-space.entity';
import { Resident } from '../../residents/entities/resident.entity';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { ReservationType } from '../../common/enums/reservation-type.enum';

/**
 * Entidad Reservation (Reserva)
 * Representa una reserva de un espacio común
 */
@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({
    type: 'enum',
    enum: ReservationType,
    nullable: true,
  })
  type: ReservationType;

  @Column({ type: 'int', nullable: true })
  numberOfGuests: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relación con CommonSpace
  @ManyToOne(() => CommonSpace, (commonSpace) => commonSpace.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commonSpaceId' })
  commonSpace: CommonSpace;

  @Column({ type: 'uuid' })
  commonSpaceId: string;

  // Relación con Resident
  @ManyToOne(() => Resident, (resident) => resident.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column({ type: 'uuid' })
  residentId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
