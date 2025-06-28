import sequelize from '../config/database.js';
import { Logger } from '../utils/logger.js';

async function runSeeders() {
  try {
    Logger.info('🌱 Iniciando seeders para RBAC...', '[Database]');
    
    // Verificar conexión
    await sequelize.authenticate();
    Logger.info('✅ Conexión a base de datos establecida', '[Database]');
    
    // Insertar permisos predeterminados
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

    const now = new Date();
    
    Logger.info('📄 Insertando permisos predeterminados...', '[Database]');
    
    // Insertar permisos uno por uno para evitar duplicados
    let insertedCount = 0;
    for (const permission of defaultPermissions) {
      try {
        await sequelize.query(`
          INSERT IGNORE INTO PERMISOS (accion, recurso, descripcion, created_at)
          VALUES (?, ?, ?, ?)
        `, {
          replacements: [permission.accion, permission.recurso, permission.descripcion, now]
        });
        insertedCount++;
      } catch (error) {
        Logger.warn(`Permiso ya existe: ${permission.accion}:${permission.recurso}`, '[Database]');
      }
    }
    
    Logger.info(`✅ ${insertedCount} permisos insertados`, '[Database]');
    
    // Obtener el rol de admin
    const [adminRoles] = await sequelize.query(`
      SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1
    `);
    
    if (adminRoles.length === 0) {
      Logger.error('❌ Rol admin no encontrado', '[Database]');
      return;
    }
    
    const adminRoleId = adminRoles[0].id;
    Logger.info(`🔑 Rol admin encontrado: ${adminRoleId}`, '[Database]');
    
    // Obtener todos los permisos
    const [permissions] = await sequelize.query(`
      SELECT id FROM PERMISOS
    `);
    
    Logger.info(`📋 Asignando ${permissions.length} permisos al rol admin...`, '[Database]');
    
    // Asignar todos los permisos al rol admin
    let assignedCount = 0;
    for (const permission of permissions) {
      try {
        await sequelize.query(`
          INSERT IGNORE INTO ROL_PERMISOS (rol_id, permiso_id, created_at)
          VALUES (?, ?, ?)
        `, {
          replacements: [adminRoleId, permission.id, now]
        });
        assignedCount++;
      } catch (error) {
        Logger.warn(`Permiso ya asignado: ${permission.id}`, '[Database]');
      }
    }
    
    Logger.info(`✅ ${assignedCount} permisos asignados al rol admin`, '[Database]');
    Logger.info('🎉 Seeders ejecutados exitosamente', '[Database]');
    
  } catch (error) {
    Logger.error(`❌ Error ejecutando seeders: ${error.message}`, '[Database]');
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

runSeeders();
