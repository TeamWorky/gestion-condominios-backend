import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { dataSourceOptions } from '../data-source';

config();

async function runSeeder() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Database connected');

    // El seeding de condominios se hace a través de CondominiumSeeder en el módulo
    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error running seeder:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeder();
