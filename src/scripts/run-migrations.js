import { Sequelize } from 'sequelize';
import config from '../config/database.config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: console.log
  }
);

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    const migrationsPath = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Asegura que las migraciones se ejecutan en orden

    console.log(`Se encontraron ${migrationFiles.length} archivos de migración.`);

    for (const migrationFile of migrationFiles) {
      console.log(`Ejecutando migración: ${migrationFile}`);
      
      // Convertir la ruta de Windows a una URL válida para ESM
      const migrationPath = `file:///${path.join(migrationsPath, migrationFile).replace(/\\/g, '/').replace(/^\//, '')}`;
      
      try {
        const migrationModule = await import(migrationPath);
        const migration = migrationModule.default;
        
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        
        console.log(`Migración ${migrationFile} ejecutada correctamente.`);
      } catch (error) {
        console.error(`Error al ejecutar la migración ${migrationFile}:`, error);
        throw error;
      }
    }

    console.log('Todas las migraciones se han ejecutado correctamente.');
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar las migraciones
runMigrations()
  .then(() => {
    console.log('Proceso de migración completado.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error en el proceso de migración:', err);
    process.exit(1);
  });
