import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

async function runSeeds() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || process.env.DB_USERNAME || 'talentonet',
    password: process.env.DB_PASSWORD || 'talentonet_secret',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'talentonet_db',
  });

  try {
    console.log('🌱 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión establecida');

    // Leer y ejecutar archivo de seed
    const seedPath = join(__dirname, '..', '..', 'migrations', '001_seed_employees.sql');
    console.log(`📂 Leyendo seed desde: ${seedPath}`);
    
    const seedSQL = readFileSync(seedPath, 'utf-8');
    
    console.log('🚀 Ejecutando seed...');
    await client.query(seedSQL);
    
    console.log('✅ Seed ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeeds();
