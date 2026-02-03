import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Building } from '../../buildings/entities/building.entity';

@Entity('condominiums')
export class Condominium extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'legal_name', nullable: true })
  legalName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rut?: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 20, name: 'postal_code', nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 500, name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  settings?: Record<string, any>;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Building, (building) => building.condominium)
  buildings: Building[];
}
