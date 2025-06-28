import { testConfig } from './test-config.service.js';
import './test-initializer.service.js'; // Auto-initialize test environment
import { app } from '../../../app.js';
import sequelize from '../../../config/database.js';
import { Logger } from '../../../utils/logger.js';
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

// Global test configuration with longer timeouts for Windows
export const globalTestConfig = testConfig.getTestConfig();

// Test Setup class (SRP: Manages test environment setup)
export class TestSetup {
  static app = app;
  static database = sequelize;

  static async initializeDatabase() {
    try {
      // Use the app's database connection
      await this.database.authenticate();
      Logger.database('Test database connection established successfully');
      return this.database;
    } catch (error) {
      Logger.error('Database', `Unable to connect to the test database: ${error.message}`);
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

      Logger.database('Test database tables reset successfully');
    } catch (error) {
      Logger.error('Database', `Error resetting test database: ${error.message}`);
      // Asegurar que las restricciones de clave foránea se reactiven
      await this.database.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error;
    }
  }

  static async setupTestEnvironment() {
    try {
      await this.initializeDatabase();
      await this.setupTestDatabase();
      Logger.database('Test environment setup completed');
    } catch (error) {
      Logger.error('Database', `Error setting up test environment: ${error.message}`);
      throw error;
    }
  }

  static async cleanupTestEnvironment() {
    try {
      // Note: Don't close the database connection as it's shared with the app
      Logger.database('Test environment cleanup completed');
    } catch (error) {
      Logger.error('Database', `Error cleaning up test environment: ${error.message}`);
      throw error;
    }
  }
}