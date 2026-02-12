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
import { Condominio } from '../../condominios/entities/condominio.entity';

/**
 * Entidad CommonExpense (Gasto Común)
 * Representa el desglose de gastos comunes para un período determinado
 */
@Entity('common_expenses')
export class CommonExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  period: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basicAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  waterAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  gasAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  parkingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  otherCharges: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relación con Condominio
  @ManyToOne(() => Condominio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'condominioId' })
  condominio: Condominio;

  @Column({ type: 'uuid' })
  condominioId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
