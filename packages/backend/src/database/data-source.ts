import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || process.env.DB_USERNAME || 'talentonet',
  password: process.env.DB_PASSWORD || 'talentonet_secret',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'talentonet_db',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', '..', 'migrations', '*{.ts,.js}')],
  synchronize: false, // NUNCA usar true en producción
  logging: process.env.NODE_ENV === 'development',
});
