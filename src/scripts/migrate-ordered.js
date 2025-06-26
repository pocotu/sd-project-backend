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

// Path to migrations
const migrationsPath = path.join(__dirname, '..', 'database', 'migrations');

// Migration order - specify the correct sequence of migrations
const migrationOrder = [
  '000_create_roles_table.js',
  '001_create_users_table.js', 
  '002_create_categories_table.js',
  '004_create_producer_profiles_table.js', // Run producer profiles before products
  '003_create_products_table.js',
  '005_create_lotes_table.js',
  '006_create_producto_lotes_table.js',
  '007_create_imagenes_producto_table.js',
  '008_create_resenias_producto_table.js',
  '009_create_calificaciones_vendedor_table.js',
  '010_create_contactos_table.js'
];

// Verify database connection and run migrations
async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create migrations table if it doesn't exist
    await createMigrationsTable();

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`Already executed migrations: ${executedMigrations.length}`);

    // Execute each migration in the specified order
    for (const migrationFile of migrationOrder) {
      if (executedMigrations.includes(migrationFile)) {
        console.log(`Migration already executed, skipping: ${migrationFile}`);
        continue;
      }

      console.log(`Executing migration: ${migrationFile}`);
      
      try {
        // Import migration file (ESM import)
        const migrationPath = `file:///${path.join(migrationsPath, migrationFile).replace(/\\/g, '/').replace(/^\//, '')}`;
        const migrationModule = await import(migrationPath);
        const migration = migrationModule.default || migrationModule;
        
        // Run migration
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        
        // Record migration as executed
        await recordMigration(migrationFile);
        
        console.log(`Migration completed: ${migrationFile}`);
      } catch (error) {
        console.error(`Error executing migration ${migrationFile}:`, error);
        throw error;
      }
    }

    console.log('All migrations executed successfully.');
  } catch (error) {
    console.error('Error executing migrations:', error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Create table to record executed migrations
async function createMigrationsTable() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
      }
    });
    console.log('SequelizeMeta table created successfully.');
  } catch (error) {
    // Ignore error if table already exists
    if (error.name === 'SequelizeTableExistsError') {
      console.log('SequelizeMeta table already exists.');
    } else {
      console.error('Error creating SequelizeMeta table:', error);
      throw error;
    }
  }
}

// Get list of already executed migrations
async function getExecutedMigrations() {
  try {
    const [results] = await sequelize.query('SELECT name FROM SequelizeMeta');
    return results.map(row => row.name);
  } catch (error) {
    console.error('Error getting executed migrations:', error);
    return [];
  }
}

// Record a migration as executed
async function recordMigration(migrationName) {
  try {
    await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
      replacements: [migrationName]
    });
    console.log(`Migration recorded: ${migrationName}`);
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error);
    throw error;
  }
}

// Execute migrations
runMigrations()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error in migration process:', err);
    process.exit(1);
  });
