import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCondominiumsTable1706650000001 implements MigrationInterface {
  name = 'CreateCondominiumsTable1706650000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'condominiums',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'legal_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'rut',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'region',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
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

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_condominiums_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_condominiums_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('condominiums', 'IDX_condominiums_deleted_at');
    await queryRunner.dropIndex('condominiums', 'IDX_condominiums_is_active');
    await queryRunner.dropTable('condominiums');
  }
}
