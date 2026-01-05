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
import { Condominio } from '../../condominios/entities/condominio.entity';
import { Unit } from '../../units/entities/unit.entity';
import { ResidentType } from '../../common/enums/resident-type.enum';
import { DocumentType } from '../../common/enums/document-type.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';

/**
 * Entidad Resident (Residente)
 * Representa un residente o propietario de una unidad
 */
@Entity('residents')
export class Resident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ResidentType,
    default: ResidentType.OWNER,
  })
  residentType: ResidentType;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.RUT,
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 100 })
  documentNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  moveInDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  moveOutDate: Date;

  // Relación con Condominio
  @ManyToOne(() => Condominio, (condominio) => condominio.residents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'condominioId' })
  condominio: Condominio;

  @Column({ type: 'uuid' })
  condominioId: string;

  // Relación con Unit
  @ManyToOne(() => Unit, (unit) => unit.residents, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ type: 'uuid', nullable: true })
  unitId: string;

  // Relaciones
  @OneToMany(() => Reservation, (reservation) => reservation.resident)
  reservations: Reservation[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
