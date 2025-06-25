import { TestSetup, globalTestConfig } from '../config/test-setup.js';
import { logger } from '../../../infrastructure/utils/logger.js';

// Tablas requeridas según el diagrama ER
const REQUIRED_TABLES = [
  'users',
  'roles',
  'permisos',
  'rol_permisos',
  'usuario_roles',
  'productos',
  'categorias',
  'imagenes_producto',
  'carritos',
  'carrito_items',
  'resenias_producto',
  'calificaciones_vendedor',
  'estadisticas_emprendedor',
  'metricas_productos',
  'metricas_vendedor',
  'perfil_productor',
  'insignias',
  'usuario_insignias',
  'lotes',
  'producto_lotes',
  'contactos',
  'export_reports'
];

// Variables de entorno críticas requeridas
const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'ADMIN_EMAIL',
  'ADMIN_INITIAL_PASSWORD',
  'ADMIN_FIRST_NAME',
  'ADMIN_LAST_NAME',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BCRYPT_SALT_ROUNDS'
];

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

describe('Fase 1: Integración y estructura base', () => {
  beforeAll(async () => {
    await TestSetup.setupTestEnvironment();
  }, globalTestConfig.testTimeout);

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  }, globalTestConfig.testTimeout);

  describe('Configuración del entorno', () => {
    it('should have all required environment variables', () => {
      const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
      expect(missing).toEqual([]);
    });

    it('should connect to database successfully', async () => {
      await expect(TestSetup.database.getInstance().authenticate()).resolves.not.toThrow();
    }, globalTestConfig.testTimeout);
  });

  describe('Estructura de base de datos', () => {
    it.each(REQUIRED_TABLES)('should have table %s', async (table) => {
      const sequelize = TestSetup.database.getInstance();
      const [results] = await sequelize.query(`SHOW TABLES LIKE '${table}'`);
      expect(results.length).toBe(1);
    }, globalTestConfig.testTimeout);
  });

  describe('Datos iniciales', () => {
    it('should have admin user with valid role', async () => {
      const sequelize = TestSetup.database.getInstance();
      const [admins] = await sequelize.query(
        `SELECT u.*, r.nombre as roleName
         FROM users u
         JOIN roles r ON u.roleId = r.id
         WHERE u.email = ? AND r.nombre = 'admin'
         LIMIT 1`,
        { replacements: [ADMIN_EMAIL] }
      );
      
      expect(admins.length).toBe(1);
      const admin = admins[0];
      expect(admin.email).toBe(ADMIN_EMAIL);
      expect(admin.roleName).toBe('admin');
    }, globalTestConfig.testTimeout);

    it('should have users and roles data from migrations and seeders', async () => {
      const sequelize = TestSetup.database.getInstance();
      
      const [[{ count: userCount }]] = await sequelize.query(
        'SELECT COUNT(*) as count FROM users'
      );
      const [[{ count: roleCount }]] = await sequelize.query(
        'SELECT COUNT(*) as count FROM roles'
      );
      
      expect(userCount).toBeGreaterThan(0);
      expect(roleCount).toBeGreaterThan(0);
    }, globalTestConfig.testTimeout);
  });

  describe('Configuración de la aplicación', () => {
    it('should have valid server configuration', () => {
      expect(process.env.PORT).toBeDefined();
      expect(process.env.NODE_ENV).toBeDefined();
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_EXPIRES_IN).toBeDefined();
    });

    it('should have valid database configuration', () => {
      expect(process.env.DB_HOST).toBeDefined();
      expect(process.env.DB_NAME).toBeDefined();
      expect(process.env.DB_USER).toBeDefined();
      expect(process.env.DB_PASSWORD).toBeDefined();
    });

    it('should have valid admin configuration', () => {
      expect(process.env.ADMIN_EMAIL).toBeDefined();
      expect(process.env.ADMIN_INITIAL_PASSWORD).toBeDefined();
      expect(process.env.ADMIN_FIRST_NAME).toBeDefined();
      expect(process.env.ADMIN_LAST_NAME).toBeDefined();
    });
  });

  describe('Migraciones y seeders', () => {
    it('should have executed migrations successfully', async () => {
      const sequelize = TestSetup.database.getInstance();
      
      // Verificar que las tablas principales existen
      const [[{ count: usersTable }]] = await sequelize.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'"
      );
      const [[{ count: rolesTable }]] = await sequelize.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'roles'"
      );
      
      expect(usersTable).toBe(1);
      expect(rolesTable).toBe(1);
    }, globalTestConfig.testTimeout);

    it('should have seeded initial data', async () => {
      const sequelize = TestSetup.database.getInstance();
      
      // Verificar que existe al menos un usuario admin
      const [[{ count: adminCount }]] = await sequelize.query(
        `SELECT COUNT(*) as count FROM users WHERE email = ?`,
        { replacements: [ADMIN_EMAIL] }
      );
      
      expect(adminCount).toBeGreaterThan(0);
    }, globalTestConfig.testTimeout);
  });
}); 