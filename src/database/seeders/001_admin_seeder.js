import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { logger } from '../../infrastructure/utils/logger.js';

export default {
  up: async (queryInterface, Sequelize) => {
    try {
      // Validar variables de entorno requeridas
      const requiredEnvVars = [
        'ADMIN_EMAIL',
        'ADMIN_INITIAL_PASSWORD',
        'BCRYPT_SALT_ROUNDS'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      // Busca el id del rol 'admin'
      const [roles] = await queryInterface.sequelize.query(
        'SELECT id FROM roles WHERE nombre = "admin" LIMIT 1'
      );
      const adminRoleId = roles[0]?.id;
      if (!adminRoleId) throw new Error('No se encontró el rol admin');

      // Generar hash de la contraseña
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, salt);

      // Verificar si el admin ya existe
      const existingAdmin = await queryInterface.rawSelect('users', {
        where: {
          email: process.env.ADMIN_EMAIL
        }
      }, ['id']);

      if (existingAdmin) {
        logger.info('Admin user already exists, skipping seeder');
        return;
      }

      // Crear usuario admin
      await queryInterface.bulkInsert('users', [{
        id: uuidv4(),
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        firstName: process.env.ADMIN_FIRST_NAME,
        lastName: process.env.ADMIN_LAST_NAME,
        roleId: adminRoleId,
        isActive: true,
        forcePasswordChange: process.env.ADMIN_FORCE_PASSWORD_CHANGE === 'true',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      logger.info('Admin user created successfully');
    } catch (error) {
      logger.error('Error in admin seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('users', {
        email: process.env.ADMIN_EMAIL
      });
      logger.info('Admin user removed successfully');
    } catch (error) {
      logger.error('Error removing admin user:', error);
      throw error;
    }
  }
};