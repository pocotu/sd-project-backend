// Test Database Service - SRP: Single Responsibility for test database setup
import { sequelize } from '../../../models/index.js';
import User from '../../../models/User.js';
import Role from '../../../models/Role.js';
import Permiso from '../../../models/Permiso.js';
import UsuarioRoles from '../../../models/UsuarioRoles.js';
import RolPermisos from '../../../models/RolPermisos.js';
import { logger } from '../../../infrastructure/utils/logger.js';

export class TestDatabaseService {
  
  static async setupDatabase() {
    try {
      // Instead of force sync, use a safer approach
      await sequelize.authenticate();
      
      // Create tables if they don't exist (safer than force)
      await sequelize.sync({ alter: false });
      
      logger.info('Test database setup completed');
      return true;
    } catch (error) {
      logger.error('Error setting up test database:', error);
      throw error;
    }
  }

  static async cleanDatabase() {
    try {
      // Clean data in correct order (respecting foreign keys)
      // Use findOrCreate pattern to avoid conflicts
      await RolPermisos.destroy({ where: {}, force: true });
      await UsuarioRoles.destroy({ where: {}, force: true });
      await Permiso.destroy({ where: {}, force: true });
      await Role.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
      
      logger.info('Test database cleaned');
    } catch (error) {
      logger.error('Error cleaning test database:', error);
      throw error;
    }
  }

  static async seedBasicData() {
    try {
      // Create basic roles using findOrCreate to avoid duplicates
      const [adminRole] = await Role.findOrCreate({
        where: { nombre: 'admin' },
        defaults: {
          nombre: 'admin',
          descripcion: 'Administrator role',
          activo: true
        }
      });

      const [userRole] = await Role.findOrCreate({
        where: { nombre: 'user' },
        defaults: {
          nombre: 'user',
          descripcion: 'Regular user role',
          activo: true
        }
      });

      // Create basic permissions with unique action names using findOrCreate
      const [readRolesPermission] = await Permiso.findOrCreate({
        where: { accion: 'leer', recurso: 'roles' },
        defaults: {
          accion: 'leer',
          recurso: 'roles',
          descripcion: 'Leer roles y permisos'
        }
      });

      const [createRolesPermission] = await Permiso.findOrCreate({
        where: { accion: 'crear', recurso: 'roles' },
        defaults: {
          accion: 'crear',
          recurso: 'roles', 
          descripcion: 'Crear roles y permisos'
        }
      });

      const [updateRolesPermission] = await Permiso.findOrCreate({
        where: { accion: 'actualizar', recurso: 'roles' },
        defaults: {
          accion: 'actualizar',
          recurso: 'roles',
          descripcion: 'Actualizar roles y permisos'
        }
      });

      const [deleteRolesPermission] = await Permiso.findOrCreate({
        where: { accion: 'eliminar', recurso: 'roles' },
        defaults: {
          accion: 'eliminar',
          recurso: 'roles',
          descripcion: 'Eliminar roles y permisos'
        }
      });

      const [assignRolesPermission] = await Permiso.findOrCreate({
        where: { accion: 'asignar', recurso: 'roles' },
        defaults: {
          accion: 'asignar',
          recurso: 'roles',
          descripcion: 'Asignar roles a usuarios'
        }
      });

      const [readUsersPermission] = await Permiso.findOrCreate({
        where: { accion: 'leer', recurso: 'usuarios' },
        defaults: {
          accion: 'leer',
          recurso: 'usuarios',
          descripcion: 'Leer usuarios del sistema'
        }
      });

      // Add permissions for managing permissions themselves
      const [createPermissionsPermission] = await Permiso.findOrCreate({
        where: { accion: 'crear', recurso: 'permisos' },
        defaults: {
          accion: 'crear',
          recurso: 'permisos',
          descripcion: 'Crear permisos del sistema'
        }
      });

      const [readPermissionsPermission] = await Permiso.findOrCreate({
        where: { accion: 'leer', recurso: 'permisos' },
        defaults: {
          accion: 'leer',
          recurso: 'permisos',
          descripcion: 'Leer permisos del sistema'
        }
      });

      const [administerSystemPermission] = await Permiso.findOrCreate({
        where: { accion: 'administrar', recurso: 'sistema' },
        defaults: {
          accion: 'administrar',
          recurso: 'sistema',
          descripcion: 'Administrar el sistema completo'
        }
      });

      // Assign all permissions to admin role (check if already exists)
      const existingRolePermissions = await RolPermisos.findAll({
        where: { rol_id: adminRole.id }
      });

      if (existingRolePermissions.length === 0) {
        await RolPermisos.bulkCreate([
          { rol_id: adminRole.id, permiso_id: readRolesPermission.id },
          { rol_id: adminRole.id, permiso_id: createRolesPermission.id },
          { rol_id: adminRole.id, permiso_id: updateRolesPermission.id },
          { rol_id: adminRole.id, permiso_id: deleteRolesPermission.id },
          { rol_id: adminRole.id, permiso_id: assignRolesPermission.id },
          { rol_id: adminRole.id, permiso_id: readUsersPermission.id },
          { rol_id: adminRole.id, permiso_id: createPermissionsPermission.id },
          { rol_id: adminRole.id, permiso_id: readPermissionsPermission.id },
          { rol_id: adminRole.id, permiso_id: administerSystemPermission.id }
        ]);
      }

      // Create test users using findOrCreate
      const [adminUser] = await User.findOrCreate({
        where: { email: 'admin@test.com' },
        defaults: {
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          password: 'hashedpassword123',
          roleId: adminRole.id,
          isActive: true
        }
      });

      const [regularUser] = await User.findOrCreate({
        where: { email: 'user@test.com' },
        defaults: {
          email: 'user@test.com', 
          firstName: 'Regular',
          lastName: 'User',
          password: 'hashedpassword123',
          roleId: userRole.id,
          isActive: true
        }
      });

      // Assign roles to users (check if already exists)
      const existingUserRoles = await UsuarioRoles.findAll({
        where: { 
          usuario_id: [adminUser.id, regularUser.id] 
        }
      });

      if (existingUserRoles.length === 0) {
        await UsuarioRoles.bulkCreate([
          { usuario_id: adminUser.id, rol_id: adminRole.id },
          { usuario_id: regularUser.id, rol_id: userRole.id }
        ]);
      }

      logger.info('Test basic data seeded');
      return { adminRole, userRole, adminUser, regularUser };
    } catch (error) {
      logger.error('Error seeding basic test data:', error);
      throw error;
    }
  }

  static async closeConnection() {
    try {
      await sequelize.close();
      logger.info('Test database connection closed');
    } catch (error) {
      logger.error('Error closing test database connection:', error);
      throw error;
    }
  }
}
