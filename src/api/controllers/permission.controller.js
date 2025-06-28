import { Logger } from '../../utils/logger.js';
import Permiso from '../../models/Permiso.js';
import RolPermisos from '../../models/RolPermisos.js';
import Role from '../../models/Role.js';

/**
 * Controlador para gestión de permisos
 * Implementa CRUD completo para permisos
 * Siguiendo principios SOLID
 */
class PermissionController {
  /**
   * Obtener todos los permisos con paginación
   */
  static async getAllPermissions(req, res) {
    try {
      Logger.info('Obteniendo lista de permisos', '[API]');
      
      const { page = 1, limit = 10, recurso } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (recurso) {
        whereClause.recurso = recurso;
      }

      const { count, rows: permissions } = await Permiso.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['recurso', 'ASC'], ['accion', 'ASC']],
        include: [
          {
            model: Role,
            as: 'roles',  // Use the correct alias from the association
            through: { model: RolPermisos, attributes: [] },
            attributes: ['id', 'nombre', 'descripcion']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          permissions,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
      
      Logger.info(`Permisos obtenidos: ${count}`, '[API]');
    } catch (error) {
      Logger.error(`Error al obtener permisos: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener un permiso por ID
   */
  static async getPermissionById(req, res) {
    try {
      const { id } = req.params;
      Logger.info(`Obteniendo permiso con ID: ${id}`, '[API]');

      const permission = await Permiso.findByPk(id, {
        include: [
          {
            model: Role,
            through: { model: RolPermisos, attributes: [] },
            attributes: ['id', 'nombre', 'descripcion']
          }
        ]
      });

      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permiso no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: permission
      });
      
      Logger.info(`Permiso encontrado: ${permission.accion}:${permission.recurso}`, '[API]');
    } catch (error) {
      Logger.error(`Error al obtener permiso: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo permiso
   */
  static async createPermission(req, res) {
    try {
      const { accion, recurso, descripcion } = req.body;
      Logger.info(`Creando nuevo permiso: ${accion}:${recurso}`, '[API]');

      const permission = await Permiso.create({
        accion,
        recurso,
        descripcion
      });

      res.status(201).json({
        success: true,
        message: 'Permiso creado exitosamente',
        data: permission
      });
      
      Logger.info(`Permiso creado exitosamente: ${accion}:${recurso}`, '[API]');
    } catch (error) {
      Logger.error(`Error al crear permiso: ${error.message}`, '[API]');
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un permiso con esa acción'
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
   * Actualizar un permiso
   */
  static async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const { accion, recurso, descripcion } = req.body;
      Logger.info(`Actualizando permiso con ID: ${id}`, '[API]');

      const permission = await Permiso.findByPk(id);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permiso no encontrado'
        });
      }

      const updateData = {};
      if (accion !== undefined) updateData.accion = accion;
      if (recurso !== undefined) updateData.recurso = recurso;
      if (descripcion !== undefined) updateData.descripcion = descripcion;

      await permission.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Permiso actualizado exitosamente',
        data: permission
      });
      
      Logger.info(`Permiso actualizado exitosamente: ${id}`, '[API]');
    } catch (error) {
      Logger.error(`Error al actualizar permiso: ${error.message}`, '[API]');
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un permiso con esa acción'
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
   * Eliminar un permiso
   */
  static async deletePermission(req, res) {
    try {
      const { id } = req.params;
      Logger.info(`Eliminando permiso con ID: ${id}`, '[API]');

      const permission = await Permiso.findByPk(id);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permiso no encontrado'
        });
      }

      // Verificar si hay roles asignados a este permiso
      const rolesConPermiso = await RolPermisos.count({
        where: { permiso_id: id }
      });

      if (rolesConPermiso > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el permiso. Hay ${rolesConPermiso} rol(es) que lo tienen asignado`
        });
      }

      await permission.destroy();

      res.status(200).json({
        success: true,
        message: 'Permiso eliminado exitosamente'
      });
      
      Logger.info(`Permiso eliminado exitosamente: ${id}`, '[API]');
    } catch (error) {
      Logger.error(`Error al eliminar permiso: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener permisos agrupados por recurso
   */
  static async getPermissionsByResource(req, res) {
    try {
      Logger.info('Obteniendo permisos agrupados por recurso', '[API]');

      const permissions = await Permiso.findAll({
        order: [['recurso', 'ASC'], ['accion', 'ASC']],
        attributes: ['id', 'accion', 'recurso', 'descripcion']
      });

      // Agrupar permisos por recurso
      const groupedPermissions = permissions.reduce((acc, permission) => {
        const { recurso } = permission;
        if (!acc[recurso]) {
          acc[recurso] = [];
        }
        acc[recurso].push(permission);
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: groupedPermissions
      });
      
      Logger.info(`Permisos agrupados por recurso obtenidos`, '[API]');
    } catch (error) {
      Logger.error(`Error al obtener permisos por recurso: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Inicializar permisos predeterminados del sistema
   */
  static async initializeDefaultPermissions(req, res) {
    try {
      Logger.info('Inicializando permisos predeterminados', '[API]');

      const defaultPermissions = [
        // Usuarios
        { accion: 'crear', recurso: 'usuarios', descripcion: 'Crear nuevos usuarios' },
        { accion: 'leer', recurso: 'usuarios', descripcion: 'Ver información de usuarios' },
        { accion: 'actualizar', recurso: 'usuarios', descripcion: 'Actualizar información de usuarios' },
        { accion: 'eliminar', recurso: 'usuarios', descripcion: 'Eliminar usuarios' },
        
        // Productos
        { accion: 'crear', recurso: 'productos', descripcion: 'Crear nuevos productos' },
        { accion: 'leer', recurso: 'productos', descripcion: 'Ver productos' },
        { accion: 'actualizar', recurso: 'productos', descripcion: 'Actualizar productos' },
        { accion: 'eliminar', recurso: 'productos', descripcion: 'Eliminar productos' },
        
        // Categorías
        { accion: 'crear', recurso: 'categorias', descripcion: 'Crear nuevas categorías' },
        { accion: 'leer', recurso: 'categorias', descripcion: 'Ver categorías' },
        { accion: 'actualizar', recurso: 'categorias', descripcion: 'Actualizar categorías' },
        { accion: 'eliminar', recurso: 'categorias', descripcion: 'Eliminar categorías' },
        
        // Pedidos
        { accion: 'crear', recurso: 'pedidos', descripcion: 'Crear nuevos pedidos' },
        { accion: 'leer', recurso: 'pedidos', descripcion: 'Ver pedidos' },
        { accion: 'actualizar', recurso: 'pedidos', descripcion: 'Actualizar estado de pedidos' },
        { accion: 'eliminar', recurso: 'pedidos', descripcion: 'Cancelar pedidos' },
        
        // Roles y Permisos
        { accion: 'crear', recurso: 'roles', descripcion: 'Crear nuevos roles' },
        { accion: 'leer', recurso: 'roles', descripcion: 'Ver roles' },
        { accion: 'actualizar', recurso: 'roles', descripcion: 'Actualizar roles' },
        { accion: 'eliminar', recurso: 'roles', descripcion: 'Eliminar roles' },
        { accion: 'asignar', recurso: 'roles', descripcion: 'Asignar roles a usuarios' },
        
        // Métricas y Reportes
        { accion: 'leer', recurso: 'metricas', descripcion: 'Ver métricas y estadísticas' },
        { accion: 'exportar', recurso: 'reportes', descripcion: 'Exportar reportes' },
        
        // Administración
        { accion: 'administrar', recurso: 'sistema', descripcion: 'Administración completa del sistema' }
      ];

      const createdPermissions = [];
      
      for (const permissionData of defaultPermissions) {
        const [permission, created] = await Permiso.findOrCreate({
          where: { accion: permissionData.accion },
          defaults: permissionData
        });
        
        if (created) {
          createdPermissions.push(permission);
        }
      }

      res.status(200).json({
        success: true,
        message: `Permisos inicializados. ${createdPermissions.length} nuevos permisos creados`,
        data: {
          newPermissions: createdPermissions,
          totalPermissions: defaultPermissions.length
        }
      });
      
      Logger.info(`Permisos predeterminados inicializados: ${createdPermissions.length} nuevos`, '[API]');
    } catch (error) {
      Logger.error(`Error al inicializar permisos: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default PermissionController;
