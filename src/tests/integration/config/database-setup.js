import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';
import { Logger } from '../../../utils/logger.js';

/**
 * Database Setup Utility for Tests
 * Siguiendo principios SOLID: SRP, DIP
 */
class DatabaseSetup {
  constructor() {
    this.loadTestEnvironment();
    this.sequelize = null;
  }

  /**
   * Load test environment variables
   * Aplicando SRP: responsabilidad única de cargar configuración de test
   */
  loadTestEnvironment() {
    // Force load test environment
    const testEnvPath = path.resolve(process.cwd(), '.env.test');
    dotenv.config({ path: testEnvPath, override: true });
    
    // Validate required variables
    const requiredVars = [
      'DB_HOST', 'DB_USER', 'DB_PASSWORD', 
      'DB_TEST_NAME', 'DB_PORT', 'JWT_SECRET'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing test environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Create database connection
   * Aplicando DIP: dependemos de abstracciones (Sequelize interface)
   */
  async createConnection() {
    try {
      this.sequelize = new Sequelize({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_TEST_NAME,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });

      await this.sequelize.authenticate();
      Logger.info('Database connection established for tests');
      return this.sequelize;
    } catch (error) {
      Logger.error(`Database connection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup test database
   * Aplicando SRP: responsabilidad única de configurar BD para tests
   */
  async setupDatabase() {
    try {
      if (!this.sequelize) {
        await this.createConnection();
      }

      // Force sync all models
      await this.sequelize.sync({ force: true });
      
      // Create default roles
      await this.createDefaultRoles();
      
      Logger.info('Test database setup completed');
      return this.sequelize;
    } catch (error) {
      Logger.error(`Test database setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create default roles for tests
   * Aplicando SRP: responsabilidad única de crear roles
   */
  async createDefaultRoles() {
    try {
      const roleQueries = [
        `INSERT IGNORE INTO roles (id, nombre, descripcion, activo, created_at) 
         VALUES (UUID(), 'user', 'Rol por defecto para usuarios', 1, NOW())`,
        `INSERT IGNORE INTO roles (id, nombre, descripcion, activo, created_at) 
         VALUES (UUID(), 'admin', 'Rol de administrador', 1, NOW())`
      ];

      for (const query of roleQueries) {
        await this.sequelize.query(query);
      }
      
      Logger.info('Default roles created');
    } catch (error) {
      Logger.error(`Error creating default roles: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up database connection
   */
  async cleanup() {
    if (this.sequelize) {
      await this.sequelize.close();
      this.sequelize = null;
    }
  }
}

export default DatabaseSetup;
