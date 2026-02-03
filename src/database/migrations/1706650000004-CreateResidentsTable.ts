import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateResidentsTable1706650000004 implements MigrationInterface {
  name = 'CreateResidentsTable1706650000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create resident_type enum
    await queryRunner.query(`
      CREATE TYPE "resident_type_enum" AS ENUM (
        'OWNER',
        'TENANT',
        'FAMILY_MEMBER',
        'GUEST'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'residents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'unit_id',
            type: 'uuid',
          },
          {
            name: 'resident_type',
            type: 'resident_type_enum',
            default: "'TENANT'",
          },
          {
            name: 'move_in_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'move_out_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'relationship',
            type: 'varchar',
            length: '100',
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
      'residents',
      new TableForeignKey({
        name: 'FK_residents_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'residents',
      new TableForeignKey({
        name: 'FK_residents_unit',
        columnNames: ['unit_id'],
        referencedTableName: 'units',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'residents',
      new TableIndex({
        name: 'IDX_residents_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'residents',
      new TableIndex({
        name: 'IDX_residents_unit_id',
        columnNames: ['unit_id'],
      }),
    );

    await queryRunner.createIndex(
      'residents',
      new TableIndex({
        name: 'IDX_residents_resident_type',
        columnNames: ['resident_type'],
      }),
    );

    await queryRunner.createIndex(
      'residents',
      new TableIndex({
        name: 'IDX_residents_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'residents',
      new TableIndex({
        name: 'IDX_residents_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('residents', 'IDX_residents_deleted_at');
    await queryRunner.dropIndex('residents', 'IDX_residents_is_active');
    await queryRunner.dropIndex('residents', 'IDX_residents_resident_type');
    await queryRunner.dropIndex('residents', 'IDX_residents_unit_id');
    await queryRunner.dropIndex('residents', 'IDX_residents_user_id');
    await queryRunner.dropForeignKey('residents', 'FK_residents_unit');
    await queryRunner.dropForeignKey('residents', 'FK_residents_user');
    await queryRunner.dropTable('residents');
    await queryRunner.query('DROP TYPE "resident_type_enum"');
  }
}
