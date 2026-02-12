import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { dataSourceOptions } from '../data-source';
import { CondominiosSeeder } from './condominios.seeder';

config();

async function runSeeder() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Database connected');

    const seeder = new CondominiosSeeder();
    await seeder.run(dataSource);

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error running seeder:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeder();
