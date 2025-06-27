import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { Sequelize } from 'sequelize';

dotenv.config();

const migrationFiles = [
  '013_create_pedidos_table.js',
  '014_create_pedido_items_table.js'
];

async function runOrderMigrations() {
  try {
    console.log('Starting order table migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    for (const migrationFile of migrationFiles) {
      try {
        console.log(`Executing migration: ${migrationFile}`);
        
        // Import migration
        const migrationPath = `../database/migrations/${migrationFile}`;
        const migration = await import(migrationPath);
        
        // Execute migration
        await migration.default.up(sequelize.getQueryInterface(), Sequelize);
        
        console.log(`Migration ${migrationFile} executed successfully.`);
      } catch (error) {
        console.error(`Error executing migration ${migrationFile}:`, error.message);
        if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
          console.log(`Table already exists, skipping migration ${migrationFile}`);
          continue;
        }
        throw error;
      }
    }
    
    console.log('All order migrations completed successfully!');
  } catch (error) {
    console.error('Error in migration process:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runOrderMigrations();
