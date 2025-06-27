import dotenv from 'dotenv';
import { app } from '../../../app.js';
import sequelize from '../../../config/database.js';
import { logger } from '../../../infrastructure/utils/logger.js';
import {
  User,
  Role,
  ProducerProfile,
  Category,
  Product,
  Contact,
  Review,
  SellerRating,
  ProductoLote,
  Lote,
  UsuarioRoles,
  Permiso,
  RolPermisos,
  Cart,
  CartItem,
  Order,
  OrderItem
} from '../../../models/index.js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

if (!process.env.DB_TEST_NAME) {
  throw new Error('DB_TEST_NAME environment variable is required for tests');
}

// Global test configuration with longer timeouts for Windows
export const globalTestConfig = {
  testTimeout: 30000,
  setupTimeout: 30000
};

// Test Setup class (SRP: Manages test environment setup)
export class TestSetup {
  static app = app;
  static database = sequelize;

  static async initializeDatabase() {
    try {
      // Use the app's database connection
      await this.database.authenticate();
      logger.info('Test database connection established successfully');
      return this.database;
    } catch (error) {
      logger.error('Unable to connect to the test database:', error);
      throw error;
    }
  }

  static async setupTestDatabase() {
    try {
      // Primero desactivar restricciones de clave foránea
      await this.database.query('SET FOREIGN_KEY_CHECKS = 0');

      // Orden correcto para eliminar las tablas (de hijas a padres)

      // Drop join tables and all tables in correct order (children to parents)
      const tablesInOrder = [
        'ROL_PERMISOS',
        'USUARIO_ROLES',
        'PERMISOS',
        'PEDIDO_ITEMS',
        'PEDIDOS',
        'CARRITO_ITEMS',
        'CARRITOS',
        'producto_lotes',
        'lotes',
        'productos',
        'contactos',
        'RESENIAS_PRODUCTO',
        'CALIFICACIONES_VENDEDOR',
        'perfil_productor',
        'categorias',
        'users',
        'roles'
      ];

      // Eliminar todas las tablas en orden
      for (const table of tablesInOrder) {
        await this.database.query(`DROP TABLE IF EXISTS ${table}`);
      }

      // Reactivar restricciones de clave foránea
      await this.database.query('SET FOREIGN_KEY_CHECKS = 1');

      // Sincronizar todos los modelos en orden correcto (de padres a hijos)

      // Sync all models in correct order (parents to children)
      const modelsInOrder = [
        Role,
        User,
        Permiso,
        Category,
        ProducerProfile,
        Product,
        Cart,
        CartItem,
        Order,
        OrderItem,
        Lote,
        ProductoLote,
        Contact,
        Review,
        SellerRating,
        UsuarioRoles,
        RolPermisos
      ];

      for (const model of modelsInOrder) {
        await model.sync({ force: true });
      }

      logger.info('Test database tables reset successfully');
    } catch (error) {
      logger.error('Error resetting test database:', error);
      // Asegurar que las restricciones de clave foránea se reactiven
      await this.database.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error;
    }
  }

  static async setupTestEnvironment() {
    try {
      await this.initializeDatabase();
      await this.setupTestDatabase();
      logger.info('Test environment setup completed');
    } catch (error) {
      logger.error('Error setting up test environment:', error);
      throw error;
    }
  }

  static async cleanupTestEnvironment() {
    try {
      // Note: Don't close the database connection as it's shared with the app
      logger.info('Test environment cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up test environment:', error);
      throw error;
    }
  }
}