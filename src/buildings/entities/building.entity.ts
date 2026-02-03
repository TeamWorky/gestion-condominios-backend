import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Condominium } from '../../condominiums/entities/condominium.entity';
import { Unit } from '../../units/entities/unit.entity';
import { CommonSpace } from '../../common-spaces/entities/common-space.entity';

@Entity('buildings')
@Unique(['condominiumId', 'code'])
export class Building extends BaseEntity {
  @Column({ type: 'uuid', name: 'condominium_id' })
  condominiumId: string;

  @ManyToOne(() => Condominium, (condominium) => condominium.buildings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'condominium_id' })
  condominium: Condominium;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'int', default: 1 })
  floors: number;

  @Column({ type: 'int', name: 'underground_floors', default: 0 })
  undergroundFloors: number;

  @Column({ type: 'boolean', name: 'has_elevator', default: false })
  hasElevator: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Unit, (unit) => unit.building)
  units: Unit[];

  @OneToMany(() => CommonSpace, (commonSpace) => commonSpace.building)
  commonSpaces: CommonSpace[];
}
