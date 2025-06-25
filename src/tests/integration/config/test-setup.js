import dotenv from 'dotenv';
import { app } from '../../../app.js';
import databaseConnection from '../../../config/database.js';
import { logger } from '../../../infrastructure/utils/logger.js';
import { User } from '../../../domain/models/user.model.js';
import { Role } from '../../../domain/models/role.model.js';

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
      await this.database.authenticate();
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
      await this.database.close();
      logger.info('Test environment cleaned up');
    } catch (error) {
      logger.error('Error cleaning up test environment:', error);
    }
  }

  // Configurar base de datos para tests
  static async setupTestDatabase() {
    try {
      const sequelize = this.database;
      // Limpiar tablas críticas para autenticación
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.query('TRUNCATE TABLE users');
      await sequelize.query('TRUNCATE TABLE roles');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      logger.info('Test tables (users, roles) cleaned');

      // Insertar roles básicos con UUIDs fijos para consistencia en los tests
      const adminRoleId = '2c81729c-5e83-40aa-a059-839b75390978';
      const userRoleId = '89af88db-4e1d-11f0-918d-244bfe6df6f7';
      await Role.upsert({
        id: adminRoleId,
        nombre: 'admin',
        descripcion: 'Administrador del sistema'
      });
      await Role.upsert({
        id: userRoleId,
        nombre: 'user',
        descripcion: 'Usuario regular'
      });

      // Insertar usuario admin con el roleId correcto
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Password123!';
      const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
      const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.upsert({
        email: adminEmail,
        password: hash,
        firstName: adminFirstName,
        lastName: adminLastName,
        roleId: adminRoleId,
        isActive: true
      });
      logger.info('Admin user and roles seeded (with fixed UUIDs)');
      return sequelize;
    } catch (error) {
      logger.error('Failed to setup test database:', error);
      throw error;
    }
  }

  // Limpiar base de datos de tests
  static async cleanupTestDatabase() {
    try {
      const sequelize = this.database;
      
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