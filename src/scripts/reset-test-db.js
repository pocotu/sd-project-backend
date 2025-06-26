import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { logger } from '../infrastructure/utils/logger.js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration for test environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_TEST_NAME || 'emprendimiento_db_test',
  dialect: 'mysql',
  logging: false
};

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

    // Read and execute SQL file
    const sqlPath = path.join(__dirname, '../../db_docs/mainProyectoDB.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split and execute each statement, ignoring DELIMITER and TRIGGER blocks
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt &&
        !stmt.toUpperCase().includes('DELIMITER') &&
        !stmt.toUpperCase().startsWith('CREATE TRIGGER') &&
        !stmt.toUpperCase().startsWith('DROP TRIGGER') &&
        !stmt.toUpperCase().startsWith('CREATE PROCEDURE') &&
        !stmt.toUpperCase().startsWith('CREATE FUNCTION')
      );
    for (let statement of statements) {
      try {
        await sequelize.query(statement);
      } catch (err) {
        logger.warn('Skipping statement due to error:', statement.substring(0, 80), err.message);
      }
    }

    // Seed test roles with consistent IDs
    try {
      await sequelize.query(`
        INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at) 
        VALUES ('19e959e4-5239-11f0-8ed1-244bfe6df6f7', 'user', 'Usuario regular', 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
      `);
      
      await sequelize.query(`
        INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at) 
        VALUES ('19e959e4-5239-11f0-8ed1-244bfe6df6f8', 'admin', 'Administrador del sistema', 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
      `);
      
      logger.info('Test roles seeded successfully');
    } catch (roleError) {
      logger.warn('Error seeding test roles:', roleError.message);
    }

    logger.info('Test database reset completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting test database:', error);
    process.exit(1);
  }
};

// Run the reset
resetTestDatabase();
