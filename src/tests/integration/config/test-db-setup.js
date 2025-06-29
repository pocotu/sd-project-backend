import { sequelize } from '../../../models/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Database setup utilities for tests
 */
export class TestDatabaseSetup {
  /**
   * Setup database for tests with proper cleanup
   */
  static async setupDatabase() {
    try {
      // Disable foreign key checks temporarily
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      
      // Drop all tables if they exist
      await sequelize.drop();
      
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      
      // Create all tables with proper associations
      await sequelize.sync({ force: false });
      
      // Create essential data for tests
      await TestDatabaseSetup.createEssentialData();
      
      console.log('Test database setup completed successfully');
    } catch (error) {
      console.error(`Test database setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create essential data needed for tests
   */
  static async createEssentialData() {
    try {
      // Create roles
      const roles = [
        {
          id: uuidv4(),
          nombre: 'admin',
          descripcion: 'Administrador del sistema',
          activo: 1,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          nombre: 'productor',
          descripcion: 'Usuario productor',
          activo: 1,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          nombre: 'consumidor',
          descripcion: 'Usuario consumidor',
          activo: 1,
          created_at: new Date(),
        },
      ];

      await sequelize.getQueryInterface().bulkInsert('roles', roles, {});
      
      console.log('Essential data created for tests');
    } catch (error) {
      console.error(`Failed to create essential data: ${error.message}`);
      // Don't throw here as roles might already exist
    }
  }

  /**
   * Clean database for tests but preserve essential data
   */
  static async cleanDatabase() {
    try {
      // Disable foreign key checks temporarily
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      
      // Get all table names except essential ones
      const [results] = await sequelize.query(`
        SELECT TABLE_NAME as table_name
        FROM information_schema.tables 
        WHERE table_schema = '${process.env.DB_NAME || 'emprendimiento_db_test'}'
        AND TABLE_NAME NOT LIKE 'SequelizeMeta'
        AND TABLE_NAME NOT IN ('roles', 'permisos')
      `);
      
      console.log(`Found ${results.length} tables to clean`);
      
      // Truncate all tables except essential ones
      for (const table of results) {
        const tableName = table.table_name || table.TABLE_NAME;
        if (tableName) {
          console.log(`Cleaning table: ${tableName}`);
          await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
        } else {
          console.warn('Skipping table with undefined name:', table);
        }
      }
      
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      
      console.log('Test database cleaned successfully');
    } catch (error) {
      console.error(`Test database cleanup failed: ${error.message}`);
      // Try to re-enable foreign key checks even if cleanup failed
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      } catch (fkError) {
        console.error('Failed to re-enable foreign key checks:', fkError.message);
      }
      throw error;
    }
  }

  /**
   * Teardown database after tests
   */
  static async teardownDatabase() {
    try {
      await sequelize.close();
      console.log('Test database connection closed');
    } catch (error) {
      console.error(`Test database teardown failed: ${error.message}`);
      throw error;
    }
  }
}
