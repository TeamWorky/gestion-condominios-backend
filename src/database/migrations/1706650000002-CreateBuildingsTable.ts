import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateBuildingsTable1706650000002 implements MigrationInterface {
  name = 'CreateBuildingsTable1706650000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'buildings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'condominium_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'floors',
            type: 'int',
            default: 1,
          },
          {
            name: 'underground_floors',
            type: 'int',
            default: 0,
          },
          {
            name: 'has_elevator',
            type: 'boolean',
            default: false,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'buildings',
      new TableForeignKey({
        name: 'FK_buildings_condominium',
        columnNames: ['condominium_id'],
        referencedTableName: 'condominiums',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'buildings',
      new TableUnique({
        name: 'UQ_buildings_condominium_code',
        columnNames: ['condominium_id', 'code'],
      }),
    );

    await queryRunner.createIndex(
      'buildings',
      new TableIndex({
        name: 'IDX_buildings_condominium_id',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'buildings',
      new TableIndex({
        name: 'IDX_buildings_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'buildings',
      new TableIndex({
        name: 'IDX_buildings_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('buildings', 'IDX_buildings_deleted_at');
    await queryRunner.dropIndex('buildings', 'IDX_buildings_is_active');
    await queryRunner.dropIndex('buildings', 'IDX_buildings_condominium_id');
    await queryRunner.dropUniqueConstraint('buildings', 'UQ_buildings_condominium_code');
    await queryRunner.dropForeignKey('buildings', 'FK_buildings_condominium');
    await queryRunner.dropTable('buildings');
  }
}
