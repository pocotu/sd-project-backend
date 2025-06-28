export default {
  up: async (queryInterface) => {
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
    const permissionsWithTimestamp = defaultPermissions.map(permission => ({
      ...permission,
      created_at: now
    }));

    await queryInterface.bulkInsert('PERMISOS', permissionsWithTimestamp);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('PERMISOS', null, {});
  }
};
