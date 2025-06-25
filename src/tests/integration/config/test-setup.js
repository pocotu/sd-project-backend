import dotenv from 'dotenv';
import { app } from '../../../app.js';
import databaseConnection from '../../../config/database.js';
import { logger } from '../../../infrastructure/utils/logger.js';

// Cargar variables de entorno para tests
dotenv.config({ path: '.env.test' });

// Configuración global para tests de integración
export class TestSetup {
  static app = app;
  static database = databaseConnection;

  // Configurar entorno de testing
  static async setupTestEnvironment() {
    try {
      // Configurar logging para tests
      logger.level = 'error'; // Solo errores en tests
      
      // Verificar conexión a BD
      await this.database.getInstance().authenticate();
      logger.info('Test database connection established');
      
      return true;
    } catch (error) {
      logger.error('Failed to setup test environment:', error);
      throw error;
    }
  }

  // Limpiar entorno de testing
  static async cleanupTestEnvironment() {
    try {
      await this.database.getInstance().close();
      logger.info('Test environment cleaned up');
    } catch (error) {
      logger.error('Error cleaning up test environment:', error);
    }
  }

  // Configurar base de datos para tests
  static async setupTestDatabase() {
    try {
      const sequelize = this.database.getInstance();
      
      // Sincronizar modelos (crear tablas)
      await sequelize.sync({ force: true });
      logger.info('Test database synchronized');
      
      return sequelize;
    } catch (error) {
      logger.error('Failed to setup test database:', error);
      throw error;
    }
  }

  // Limpiar base de datos de tests
  static async cleanupTestDatabase() {
    try {
      const sequelize = this.database.getInstance();
      
      // Cerrar conexión
      await sequelize.close();
      logger.info('Test database connection closed');
    } catch (error) {
      logger.error('Error cleaning up test database:', error);
    }
  }
}

// Configuración global de Jest
export const globalTestConfig = {
  // Timeout para tests de integración
  testTimeout: 30000,
  
  // Configuración de base de datos
  database: {
    // Usar base de datos de test
    name: process.env.DB_NAME_TEST || 'test_emprendimiento_db',
    // Configuración de pool para tests
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}; 