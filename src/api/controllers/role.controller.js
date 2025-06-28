import { Logger } from '../../utils/logger.js';
import Role from '../../models/Role.js';
import Permiso from '../../models/Permiso.js';
import RolPermisos from '../../models/RolPermisos.js';
import UsuarioRoles from '../../models/UsuarioRoles.js';
import User from '../../models/User.js';
import sequelize from '../../config/database.js';

/**
 * Controlador para gestión de roles y permisos (RBAC)
 * Implementa CRUD completo para roles y permisos
 * Siguiendo principios SOLID
 */
class RoleController {
  /**
   * Obtener todos los roles con paginación
   */
  static async getAllRoles(req, res) {
    try {
      Logger.info('Obteniendo lista de roles', '[API]');
      
      const { page = 1, limit = 10, active } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (active !== undefined) {
        whereClause.activo = active === 'true';
      }

      const { count, rows: roles } = await Role.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Permiso,
            as: 'permisos', // Add the alias
            through: { model: RolPermisos, attributes: [] },
            attributes: ['id', 'accion', 'recurso', 'descripcion']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          roles,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
      
      Logger.info(`Roles obtenidos: ${count}`, '[API]');
    } catch (error) {
      Logger.error(`Error al obtener roles: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener un rol por ID
   */
  static async getRoleById(req, res) {
    try {
      const { id } = req.params;
      Logger.info(`Obteniendo rol con ID: ${id}`, '[API]');

      const role = await Role.findByPk(id, {
        include: [
          {
            model: Permiso,
            as: 'permisos', // Add the alias
            through: { model: RolPermisos, attributes: [] },
            attributes: ['id', 'accion', 'recurso', 'descripcion']
          }
        ]
      });

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: role
      });
      
      Logger.info(`Rol encontrado: ${role.nombre}`, '[API]');
    } catch (error) {
      Logger.error(`Error al obtener rol: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo rol
   */
  static async createRole(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { nombre, descripcion, permisos = [] } = req.body;
      Logger.info(`Creando nuevo rol: ${nombre}`, '[API]');

      // Crear el rol
      const role = await Role.create({
        nombre,
        descripcion,
        activo: 1
      }, { transaction });

      // Asignar permisos si se proporcionan
      if (permisos.length > 0) {
        const rolePermissions = permisos.map(permisoId => ({
          rol_id: role.id,
          permiso_id: permisoId
        }));
        
        await RolPermisos.bulkCreate(rolePermissions, { transaction });
      }

      await transaction.commit();

      // Obtener el rol completo con permisos
      const roleCompleto = await Role.findByPk(role.id, {
        include: [
          {
            model: Permiso,
            as: 'permisos', // Add the alias
            through: { model: RolPermisos, attributes: [] },
            attributes: ['id', 'accion', 'recurso', 'descripcion']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: roleCompleto
      });
      
      Logger.info(`Rol creado exitosamente: ${nombre}`, '[API]');
    } catch (error) {
      // Only rollback if transaction is still active
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      Logger.error(`Error al crear rol: ${error.message}`, '[API]');
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un rol con ese nombre'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar un rol
   */
  static async updateRole(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo, permisos } = req.body;
      Logger.info(`Actualizando rol con ID: ${id}`, '[API]');

      const role = await Role.findByPk(id);
      if (!role) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      // Actualizar campos del rol
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (activo !== undefined) updateData.activo = activo;

      await role.update(updateData, { transaction });

      // Actualizar permisos si se proporcionan
      if (permisos !== undefined) {
        // Eliminar permisos actuales
        await RolPermisos.destroy({
          where: { rol_id: id },
          transaction
        });

        // Asignar nuevos permisos
        if (permisos.length > 0) {
          const rolePermissions = permisos.map(permisoId => ({
            rol_id: id,
            permiso_id: permisoId
          }));
          
          await RolPermisos.bulkCreate(rolePermissions, { transaction });
        }
      }

      await transaction.commit();

      // Obtener el rol actualizado con permisos
      const roleActualizado = await Role.findByPk(id, {
        include: [
          {
            model: Permiso,
            as: 'permisos', // Add the alias
            through: { model: RolPermisos, attributes: [] },
            attributes: ['id', 'accion', 'recurso', 'descripcion']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: roleActualizado
      });
      
      Logger.info(`Rol actualizado exitosamente: ${id}`, '[API]');
    } catch (error) {
      await transaction.rollback();
      Logger.error(`Error al actualizar rol: ${error.message}`, '[API]');
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un rol con ese nombre'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar un rol (soft delete)
   */
  static async deleteRole(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      Logger.info(`Eliminando rol con ID: ${id}`, '[API]');

      const role = await Role.findByPk(id);
      if (!role) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      // Verificar si hay usuarios asignados a este rol
      const usuariosConRol = await UsuarioRoles.count({
        where: { rol_id: id }
      });

      if (usuariosConRol > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el rol. Hay ${usuariosConRol} usuario(s) asignado(s) a este rol`
        });
      }

      // Eliminar permisos del rol
      await RolPermisos.destroy({
        where: { rol_id: id },
        transaction
      });

      // Desactivar el rol (soft delete)
      await role.update({ activo: 0 }, { transaction });

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: 'Rol eliminado exitosamente'
      });
      
      Logger.info(`Rol eliminado exitosamente: ${id}`, '[API]');
    } catch (error) {
      await transaction.rollback();
      Logger.error(`Error al eliminar rol: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Asignar rol a usuario
   */
  static async assignRoleToUser(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { userId, roleId, expiresAt } = req.body;
      Logger.info(`Asignando rol ${roleId} a usuario ${userId}`, '[API]');

      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que el rol existe y está activo
      const role = await Role.findByPk(roleId);
      if (!role || !role.activo) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado o inactivo'
        });
      }

      // Verificar si ya tiene el rol asignado
      const existingAssignment = await UsuarioRoles.findOne({
        where: { usuario_id: userId, rol_id: roleId }
      });

      if (existingAssignment) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'El usuario ya tiene este rol asignado'
        });
      }

      // Crear la asignación
      const assignment = await UsuarioRoles.create({
        usuario_id: userId,
        rol_id: roleId,
        expires_at: expiresAt || null
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Rol asignado exitosamente al usuario',
        data: assignment
      });
      
      Logger.info(`Rol asignado exitosamente: ${roleId} a usuario ${userId}`, '[API]');
    } catch (error) {
      await transaction.rollback();
      Logger.error(`Error al asignar rol: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Remover rol de usuario
   */
  static async removeRoleFromUser(req, res) {
    try {
      const { userId, roleId } = req.params;
      Logger.info(`Removiendo rol ${roleId} de usuario ${userId}`, '[API]');

      const assignment = await UsuarioRoles.findOne({
        where: { usuario_id: userId, rol_id: roleId }
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Asignación de rol no encontrada'
        });
      }

      await assignment.destroy();

      res.status(200).json({
        success: true,
        message: 'Rol removido exitosamente del usuario'
      });
      
      Logger.info(`Rol removido exitosamente: ${roleId} de usuario ${userId}`, '[API]');
    } catch (error) {
      Logger.error(`Error al remover rol: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener usuarios con sus roles
   */
  static async getUsersWithRoles(req, res) {
    try {
      Logger.info('Obteniendo usuarios con roles', '[API]');
      
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'DESC']],
        attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
        include: [
          {
            model: Role,
            as: 'roles', // Add the alias for the many-to-many relationship
            through: { 
              model: UsuarioRoles, 
              attributes: ['asignado_at', 'expires_at'] 
            },
            attributes: ['id', 'nombre', 'descripcion']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
      
      Logger.info(`Usuarios con roles obtenidos: ${count}`, '[API]');
    } catch (error) {
      Logger.error(`Error al obtener usuarios con roles: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default RoleController;
