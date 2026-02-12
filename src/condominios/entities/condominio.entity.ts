import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Building } from '../../buildings/entities/building.entity';
import { Resident } from '../../residents/entities/resident.entity';

/**
 * Entidad Condominio
 * Representa un condominio que agrupa edificios, unidades, residentes, etc.
 * Permite mantener separados los datos de diferentes condominios (multi-tenant)
 */
@Entity('condominios')
export class Condominio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relaciones: Building/Resident de main usan Condominium; se usa type assertion para compatibilidad
  @OneToMany(
    () => Building,
    (building: Building & { condominio?: Condominio }) => building.condominio,
  )
  buildings: Building[];

  @OneToMany(
    () => Resident,
    (resident: Resident & { condominio?: Condominio }) => resident.condominio,
  )
  residents: Resident[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
