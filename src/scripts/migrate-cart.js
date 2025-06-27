import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  logging: console.log
};

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging
  }
);

const MIGRATIONS_PATH = path.join(__dirname, '../database/migrations');

async function runCartMigrations() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS SequelizeMeta (
        name VARCHAR(255) NOT NULL UNIQUE,
        PRIMARY KEY (name)
      ) ENGINE=InnoDB;
    `);

    // Get executed migrations
    const [executedMigrations] = await sequelize.query("SELECT name FROM SequelizeMeta");
    const executedMigrationNames = executedMigrations.map(row => row.name);
    
    console.log('Already executed migrations:', executedMigrationNames.length);

    // Cart migration files
    const cartMigrations = [
      '011_create_carritos_table.js',
      '012_create_carrito_items_table.js'
    ];

    for (const migrationFile of cartMigrations) {
      if (executedMigrationNames.includes(migrationFile)) {
        console.log(`Skipping already executed migration: ${migrationFile}`);
        continue;
      }

      console.log(`Executing migration: ${migrationFile}`);
      const migrationPath = path.join(MIGRATIONS_PATH, migrationFile);
      
      if (fs.existsSync(migrationPath)) {
        const migrationUrl = `file:///${migrationPath.replace(/\\/g, '/')}`;
        const migration = await import(migrationUrl);
        
        try {
          await migration.default.up(sequelize.getQueryInterface(), Sequelize);
          
          // Mark as executed
          await sequelize.query(
            "INSERT INTO SequelizeMeta (name) VALUES (?)",
            { replacements: [migrationFile] }
          );
          
          console.log(`✓ Migration ${migrationFile} executed successfully`);
        } catch (error) {
          console.error(`Error executing migration ${migrationFile}:`, error.message);
          throw error;
        }
      } else {
        console.log(`Migration file not found: ${migrationFile}`);
      }
    }

    console.log('All cart migrations completed successfully!');

  } catch (error) {
    console.error('Error in cart migration process:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runCartMigrations();
