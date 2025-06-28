import { Logger } from '../../utils/logger.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Permiso from '../../models/Permiso.js';
import UsuarioRoles from '../../models/UsuarioRoles.js';
import RolPermisos from '../../models/RolPermisos.js';
import { Op } from 'sequelize';

/**
 * Middleware de autorización basado en roles y permisos granular
 * Implementa RBAC (Role-Based Access Control) completo
 * Siguiendo principios SOLID
 */
class RBACMiddleware {
  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} accion - Acción requerida (crear, leer, actualizar, eliminar, etc.)
   * @param {string} recurso - Recurso al que se quiere acceder
   */
  static requirePermission(accion, recurso) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        
        if (!userId) {
          Logger.warn('Intento de acceso sin autenticación', '[Auth]');
          return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
          });
        }

        Logger.info(`Verificando permiso ${accion}:${recurso} para usuario ${userId}`, '[Auth]');

        // Verificar si el usuario tiene el permiso requerido
        const hasPermission = await RBACMiddleware.checkUserPermission(userId, accion, recurso);

        if (!hasPermission) {
          Logger.warn(`Acceso denegado. Usuario ${userId} no tiene permiso ${accion}:${recurso}`, '[Auth]');
          return res.status(403).json({
            success: false,
            message: `No tienes permisos para ${accion} ${recurso}`
          });
        }

        Logger.info(`Permiso ${accion}:${recurso} concedido para usuario ${userId}`, '[Auth]');
        next();
      } catch (error) {
        Logger.error(`Error en verificación de permisos: ${error.message}`, '[Auth]');
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    };
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   * @param {string[]} rolesRequeridos - Array de nombres de roles
   */
  static requireAnyRole(rolesRequeridos) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        
        if (!userId) {
          Logger.warn('Intento de acceso sin autenticación', '[Auth]');
          return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
          });
        }

        Logger.info(`Verificando roles ${rolesRequeridos.join(', ')} para usuario ${userId}`, '[Auth]');

        // Obtener roles del usuario
        const userRoles = await RBACMiddleware.getUserRoles(userId);
        const userRoleNames = userRoles.map(role => role.nombre);

        // Verificar si tiene alguno de los roles requeridos
        const hasRequiredRole = rolesRequeridos.some(role => userRoleNames.includes(role));

        if (!hasRequiredRole) {
          Logger.warn(`Acceso denegado. Usuario ${userId} no tiene los roles requeridos: ${rolesRequeridos.join(', ')}`, '[Auth]');
          return res.status(403).json({
            success: false,
            message: `Se requiere uno de los siguientes roles: ${rolesRequeridos.join(', ')}`
          });
        }

        Logger.info(`Acceso concedido. Usuario ${userId} tiene rol válido`, '[Auth]');
        req.userRoles = userRoleNames;
        next();
      } catch (error) {
        Logger.error(`Error en verificación de roles: ${error.message}`, '[Auth]');
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    };
  }

  /**
   * Verificar si el usuario tiene todos los roles especificados
   * @param {string[]} rolesRequeridos - Array de nombres de roles
   */
  static requireAllRoles(rolesRequeridos) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        
        if (!userId) {
          Logger.warn('Intento de acceso sin autenticación', '[Auth]');
          return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
          });
        }

        Logger.info(`Verificando todos los roles ${rolesRequeridos.join(', ')} para usuario ${userId}`, '[Auth]');

        // Obtener roles del usuario
        const userRoles = await RBACMiddleware.getUserRoles(userId);
        const userRoleNames = userRoles.map(role => role.nombre);

        // Verificar si tiene todos los roles requeridos
        const hasAllRoles = rolesRequeridos.every(role => userRoleNames.includes(role));

        if (!hasAllRoles) {
          Logger.warn(`Acceso denegado. Usuario ${userId} no tiene todos los roles requeridos: ${rolesRequeridos.join(', ')}`, '[Auth]');
          return res.status(403).json({
            success: false,
            message: `Se requieren todos los siguientes roles: ${rolesRequeridos.join(', ')}`
          });
        }

        Logger.info(`Acceso concedido. Usuario ${userId} tiene todos los roles requeridos`, '[Auth]');
        req.userRoles = userRoleNames;
        next();
      } catch (error) {
        Logger.error(`Error en verificación de roles: ${error.message}`, '[Auth]');
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    };
  }

  /**
   * Verificar si el usuario es administrador
   */
  static requireAdmin() {
    return RBACMiddleware.requireAnyRole(['admin']);
  }

  /**
   * Verificar si el usuario puede acceder a sus propios recursos o es admin
   * @param {string} userIdField - Campo donde está el ID del usuario en req.params
   */
  static requireOwnershipOrAdmin(userIdField = 'userId') {
    return async (req, res, next) => {
      try {
        const currentUserId = req.user?.id;
        const targetUserId = req.params[userIdField];
        
        if (!currentUserId) {
          Logger.warn('Intento de acceso sin autenticación', '[Auth]');
          return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
          });
        }

        Logger.info(`Verificando propiedad o admin para usuario ${currentUserId} accediendo a ${targetUserId}`, '[Auth]');

        // Si es el mismo usuario, permitir acceso
        if (currentUserId === targetUserId) {
          Logger.info(`Acceso concedido por propiedad: usuario ${currentUserId}`, '[Auth]');
          return next();
        }

        // Verificar si es administrador
        const userRoles = await RBACMiddleware.getUserRoles(currentUserId);
        const isAdmin = userRoles.some(role => role.nombre === 'admin');

        if (isAdmin) {
          Logger.info(`Acceso concedido por rol admin: usuario ${currentUserId}`, '[Auth]');
          req.userRoles = userRoles.map(role => role.nombre);
          return next();
        }

        Logger.warn(`Acceso denegado. Usuario ${currentUserId} no es propietario ni admin`, '[Auth]');
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      } catch (error) {
        Logger.error(`Error en verificación de propiedad: ${error.message}`, '[Auth]');
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    };
  }

  /**
   * Middleware dinámico que permite diferentes niveles de acceso
   * @param {Object} config - Configuración de permisos
   */
  static dynamicPermission(config) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        
        if (!userId) {
          Logger.warn('Intento de acceso sin autenticación', '[Auth]');
          return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
          });
        }

        const method = req.method.toLowerCase();
        const requiredAccess = config[method];

        if (!requiredAccess) {
          Logger.warn(`Método ${method} no configurado en permisos dinámicos`, '[Auth]');
          return res.status(405).json({
            success: false,
            message: 'Método no permitido'
          });
        }

        Logger.info(`Verificando permiso dinámico para ${method}: ${JSON.stringify(requiredAccess)}`, '[Auth]');

        // Verificar diferentes tipos de configuración
        if (requiredAccess.roles && requiredAccess.roles.length > 0) {
          const userRoles = await RBACMiddleware.getUserRoles(userId);
          const userRoleNames = userRoles.map(role => role.nombre);
          const hasRole = requiredAccess.roles.some(role => userRoleNames.includes(role));
          
          if (!hasRole) {
            Logger.warn(`Acceso denegado por roles para usuario ${userId}`, '[Auth]');
            return res.status(403).json({
              success: false,
              message: `Se requiere uno de los siguientes roles: ${requiredAccess.roles.join(', ')}`
            });
          }
        }

        if (requiredAccess.permission) {
          const { accion, recurso } = requiredAccess.permission;
          const hasPermission = await RBACMiddleware.checkUserPermission(userId, accion, recurso);
          
          if (!hasPermission) {
            Logger.warn(`Acceso denegado por permiso ${accion}:${recurso} para usuario ${userId}`, '[Auth]');
            return res.status(403).json({
              success: false,
              message: `No tienes permisos para ${accion} ${recurso}`
            });
          }
        }

        if (requiredAccess.ownership) {
          const targetUserId = req.params[requiredAccess.ownership.field];
          if (userId !== targetUserId) {
            const userRoles = await RBACMiddleware.getUserRoles(userId);
            const isAdmin = userRoles.some(role => role.nombre === 'admin');
            
            if (!isAdmin) {
              Logger.warn(`Acceso denegado por propiedad para usuario ${userId}`, '[Auth]');
              return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
              });
            }
          }
        }

        Logger.info(`Permiso dinámico concedido para usuario ${userId}`, '[Auth]');
        next();
      } catch (error) {
        Logger.error(`Error en verificación de permisos dinámicos: ${error.message}`, '[Auth]');
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    };
  }

  /**
   * Función auxiliar para verificar si un usuario tiene un permiso específico
   * @param {string} userId - ID del usuario
   * @param {string} accion - Acción requerida
   * @param {string} recurso - Recurso al que se quiere acceder
   */
  static async checkUserPermission(userId, accion, recurso) {
    try {
      // Buscar el permiso específico
      const permiso = await Permiso.findOne({
        where: { accion, recurso }
      });

      if (!permiso) {
        Logger.warn(`Permiso ${accion}:${recurso} no existe en el sistema`, '[Auth]');
        return false;
      }

      // Buscar si el usuario tiene este permiso a través de sus roles
      const hasPermission = await UsuarioRoles.findOne({
        where: {
          usuario_id: userId,
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } }
          ]
        },
        include: [
          {
            model: Role,
            as: 'role',  // Use the alias we defined in the association
            required: true,
            where: { activo: 1 },
            include: [
              {
                model: Permiso,
                where: { id: permiso.id },
                through: { model: RolPermisos, attributes: [] },
                required: true,
                as: 'permisos'  // Use the alias for permissions
              }
            ]
          }
        ]
      });

      return !!hasPermission;
    } catch (error) {
      Logger.error(`Error al verificar permiso: ${error.message}`, '[Auth]');
      return false;
    }
  }

  /**
   * Función auxiliar para obtener los roles de un usuario
   * @param {string} userId - ID del usuario
   */
  static async getUserRoles(userId) {
    try {
      const userRoles = await UsuarioRoles.findAll({
        where: {
          usuario_id: userId,
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } }
          ]
        },
        include: [
          {
            model: Role,
            as: 'role', // Add the alias
            where: { activo: 1 },
            attributes: ['id', 'nombre', 'descripcion']
          }
        ]
      });

      return userRoles.map(ur => ur.role);
    } catch (error) {
      Logger.error(`Error al obtener roles del usuario: ${error.message}`, '[Auth]');
      return [];
    }
  }

  /**
   * Función auxiliar para obtener todos los permisos de un usuario
   * @param {string} userId - ID del usuario
   */
  static async getUserPermissions(userId) {
    try {
      const userRoles = await RBACMiddleware.getUserRoles(userId);
      const roleIds = userRoles.map(role => role.id);

      if (roleIds.length === 0) {
        return [];
      }

      const permissions = await RolPermisos.findAll({
        where: { rol_id: { [Op.in]: roleIds } },
        include: [
          {
            model: Permiso,
            attributes: ['id', 'accion', 'recurso', 'descripcion']
          }
        ]
      });

      // Eliminar duplicados
      const uniquePermissions = [];
      const seen = new Set();

      permissions.forEach(rp => {
        const key = `${rp.Permiso.accion}:${rp.Permiso.recurso}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniquePermissions.push(rp.Permiso);
        }
      });

      return uniquePermissions;
    } catch (error) {
      Logger.error(`Error al obtener permisos del usuario: ${error.message}`, '[Auth]');
      return [];
    }
  }

  /**
   * Middleware para agregar información de roles y permisos al request
   */
  static enrichUserContext() {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        
        if (userId) {
          const [roles, permissions] = await Promise.all([
            RBACMiddleware.getUserRoles(userId),
            RBACMiddleware.getUserPermissions(userId)
          ]);

          req.userRoles = roles.map(role => role.nombre);
          req.userPermissions = permissions.map(p => ({
            accion: p.accion,
            recurso: p.recurso,
            descripcion: p.descripcion
          }));

          Logger.info(`Contexto de usuario enriquecido: ${req.userRoles.length} roles, ${req.userPermissions.length} permisos`, '[Auth]');
        }

        next();
      } catch (error) {
        Logger.error(`Error al enriquecer contexto de usuario: ${error.message}`, '[Auth]');
        next(); // Continuar sin enriquecer en caso de error
      }
    };
  }
}

export default RBACMiddleware;
