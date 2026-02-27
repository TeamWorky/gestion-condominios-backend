import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddParkingAndStorageToUnits1706650000007
  implements MigrationInterface
{
  name = 'AddParkingAndStorageToUnits1706650000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('units');
    
    // Agregar parking_spots si no existe
    const hasParkingSpots = table?.columns.some((c) => c.name === 'parking_spots');
    if (!hasParkingSpots) {
      await queryRunner.addColumn(
        'units',
        new TableColumn({
          name: 'parking_spots',
          type: 'int',
          isNullable: true,
          default: 0,
        }),
      );
    }

    // Agregar storage_units si no existe
    const hasStorageUnits = table?.columns.some((c) => c.name === 'storage_units');
    if (!hasStorageUnits) {
      await queryRunner.addColumn(
        'units',
        new TableColumn({
          name: 'storage_units',
          type: 'int',
          isNullable: true,
          default: 0,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('units');
    
    if (table?.columns.some((c) => c.name === 'parking_spots')) {
      await queryRunner.dropColumn('units', 'parking_spots');
    }
    
    if (table?.columns.some((c) => c.name === 'storage_units')) {
      await queryRunner.dropColumn('units', 'storage_units');
    }
  }
}
