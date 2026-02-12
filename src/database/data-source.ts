import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

// Use TypeScript entities when running in dev (ts-node), otherwise use compiled JavaScript
const entitiesPath =
  process.env.NODE_ENV === 'production'
    ? ['dist/**/*.entity.js']
    : [__dirname + '/../**/*.entity.{ts,js}'];

const migrationsPath =
  process.env.NODE_ENV === 'production'
    ? ['dist/database/migrations/*.js']
    : [__dirname + '/migrations/*.{ts,js}'];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'nest_proptech',
  entities: entitiesPath,
  migrations: migrationsPath,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
