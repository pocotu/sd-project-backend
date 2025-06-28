import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../infrastructure/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration for test environment
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_TEST_NAME,
  dialect: 'mysql',
  logging: false
};

// Validate required environment variables
const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_TEST_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const resetTestDatabase = async () => {
  try {
    logger.info('Resetting test database...');

    // Drop database if exists and create new one
    await sequelize.query(`DROP DATABASE IF EXISTS ${dbConfig.database}`);
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await sequelize.query(`USE ${dbConfig.database}`);

    // Get migration files in order
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    // Run migrations in order
    for (const file of migrationFiles) {
      try {
        logger.info(`Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const migration = await import(`file://${migrationPath}`);
        const migrationObject = migration.default;
        
        await migrationObject.up(sequelize.getQueryInterface(), Sequelize);
        logger.info(`Migration ${file} completed successfully`);
      } catch (err) {
        logger.error(`Error running migration ${file}:`, err.message);
        // Continue with other migrations for now
      }
    }

    // Seed test roles with consistent IDs after migrations
    try {
      await sequelize.query(`
        INSERT INTO roles (id, nombre, descripcion, activo, created_at) 
        VALUES ('19e959e4-5239-11f0-8ed1-244bfe6df6f7', 'user', 'Usuario regular', 1, NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
      `);
      
      await sequelize.query(`
        INSERT INTO roles (id, nombre, descripcion, activo, created_at) 
        VALUES ('19e959e4-5239-11f0-8ed1-244bfe6df6f8', 'admin', 'Administrador del sistema', 1, NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
      `);
      
      logger.info('Test roles seeded successfully');
    } catch (roleError) {
      logger.warn('Error seeding test roles:', roleError.message);
    }

    // Seed test categories for products
    try {
      await sequelize.query(`
        INSERT INTO CATEGORIAS (id, nombre, descripcion, slug, activo, created_at) VALUES
        (1, 'Alimentos', 'Productos alimenticios', 'alimentos', 1, NOW()),
        (2, 'Artesanías', 'Productos artesanales', 'artesanias', 1, NOW()),
        (3, 'Servicios', 'Servicios varios', 'servicios', 1, NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
      `);
      
      logger.info('Test categories seeded successfully');
    } catch (categoryError) {
      logger.warn('Error seeding test categories:', categoryError.message);
    }

    logger.info('Test database reset completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting test database:', error);
    process.exit(1);
  }
};

// Run the reset
resetTestDatabase();
