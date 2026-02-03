import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateUnitsTable1706650000003 implements MigrationInterface {
  name = 'CreateUnitsTable1706650000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create unit_type enum
    await queryRunner.query(`
      CREATE TYPE "unit_type_enum" AS ENUM (
        'APARTMENT',
        'HOUSE',
        'OFFICE',
        'COMMERCIAL',
        'PARKING',
        'STORAGE'
      )
    `);

    // Create unit_status enum
    await queryRunner.query(`
      CREATE TYPE "unit_status_enum" AS ENUM (
        'AVAILABLE',
        'OCCUPIED',
        'MAINTENANCE',
        'RESERVED',
        'OUT_OF_SERVICE'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'units',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'building_id',
            type: 'uuid',
          },
          {
            name: 'number',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'floor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'block',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'unit_type',
            type: 'unit_type_enum',
            default: "'APARTMENT'",
          },
          {
            name: 'area_m2',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'aliquot',
            type: 'decimal',
            precision: 5,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'bedrooms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'bathrooms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'unit_status_enum',
            default: "'AVAILABLE'",
          },
          {
            name: 'is_occupied',
            type: 'boolean',
            default: false,
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
      'units',
      new TableForeignKey({
        name: 'FK_units_building',
        columnNames: ['building_id'],
        referencedTableName: 'buildings',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'units',
      new TableUnique({
        name: 'UQ_units_building_number',
        columnNames: ['building_id', 'number'],
      }),
    );

    await queryRunner.createIndex(
      'units',
      new TableIndex({
        name: 'IDX_units_building_id',
        columnNames: ['building_id'],
      }),
    );

    await queryRunner.createIndex(
      'units',
      new TableIndex({
        name: 'IDX_units_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'units',
      new TableIndex({
        name: 'IDX_units_unit_type',
        columnNames: ['unit_type'],
      }),
    );

    await queryRunner.createIndex(
      'units',
      new TableIndex({
        name: 'IDX_units_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('units', 'IDX_units_deleted_at');
    await queryRunner.dropIndex('units', 'IDX_units_unit_type');
    await queryRunner.dropIndex('units', 'IDX_units_status');
    await queryRunner.dropIndex('units', 'IDX_units_building_id');
    await queryRunner.dropUniqueConstraint('units', 'UQ_units_building_number');
    await queryRunner.dropForeignKey('units', 'FK_units_building');
    await queryRunner.dropTable('units');
    await queryRunner.query('DROP TYPE "unit_status_enum"');
    await queryRunner.query('DROP TYPE "unit_type_enum"');
  }
}
