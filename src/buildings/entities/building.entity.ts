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
import { CommonSpace } from '../../common-spaces/entities/common-space.entity';

/**
 * Entidad Building (Edificio)
 * Representa un edificio o torre dentro de un condominio
 */
@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  totalFloors: number;

  @Column({ type: 'int', nullable: true })
  totalUnits: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relación con Condominio
  @ManyToOne(() => Condominio, (condominio) => condominio.buildings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'condominioId' })
  condominio: Condominio;

  @Column({ type: 'uuid' })
  condominioId: string;

  // Relaciones
  @OneToMany(() => Unit, (unit) => unit.building)
  units: Unit[];

  @OneToMany(() => CommonSpace, (commonSpace) => commonSpace.building)
  commonSpaces: CommonSpace[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
