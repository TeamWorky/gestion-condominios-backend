import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class RemoveCondominiosTable1706650000008
  implements MigrationInterface
{
  name = 'RemoveCondominiosTable1706650000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla existe antes de eliminarla
    const table = await queryRunner.getTable('condominios');
    
    if (table) {
      // Eliminar foreign keys primero si existen
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('condominios', fk);
      }
      
      // Eliminar índices si existen
      const indices = table.indices;
      for (const index of indices) {
        await queryRunner.dropIndex('condominios', index);
      }
      
      // Eliminar la tabla
      await queryRunner.dropTable('condominios');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No revertir esta migración ya que la tabla condominios era obsoleta
    // Si necesitas recrearla, usa la estructura de condominiums como referencia
  }
}
