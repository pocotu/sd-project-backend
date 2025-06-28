import { Logger } from '../../utils/logger.js';
import sequelize from '../../config/database.js';
import { QueryTypes } from 'sequelize';

/**
 * Servicio de métricas
 * Implementa la lógica de negocio para obtener métricas y estadísticas
 * Siguiendo principios SOLID: SRP, OCP, DIP
 */
export class MetricsService {
  
  /**
   * Obtener métricas de productos
   */
  static async getProductMetrics(filters = {}) {
    try {
      const { productId, startDate, endDate, period = 'daily' } = filters;
      
      let whereClause = '';
      const replacements = {};
      
      if (productId) {
        whereClause += ' AND p.id = :productId';
        replacements.productId = productId;
      }
      
      if (startDate) {
        whereClause += ' AND p.created_at >= :startDate';
        replacements.startDate = startDate;
      }
      
      if (endDate) {
        whereClause += ' AND p.created_at <= :endDate';
        replacements.endDate = endDate;
      }

      // Métricas generales de productos
      const generalMetrics = await this._getGeneralProductMetrics(whereClause, replacements);
      
      // Métricas por categoría
      const categoryMetrics = await this._getCategoryMetrics(whereClause, replacements);
      
      // Top productos más vistos
      const topViewed = await this._getTopViewedProducts(whereClause, replacements);
      
      // Productos mejor calificados
      const topRated = await this._getTopRatedProducts(whereClause, replacements);

      return {
        general: generalMetrics[0],
        byCategory: categoryMetrics,
        topViewed,
        topRated,
        filters: {
          productId: productId || null,
          startDate: startDate || null,
          endDate: endDate || null,
          period
        }
      };
    } catch (error) {
      Logger.error(`Error en getProductMetrics: ${error.message}`, '[MetricsService]');
      throw error;
    }
  }

  /**
   * Obtener métricas de vendedores
   */
  static async getSellerMetrics(filters = {}) {
    try {
      const { sellerId, startDate, endDate } = filters;
      
      let whereClause = '';
      const replacements = {};
      
      if (sellerId) {
        whereClause += ' AND pp.id = :sellerId';
        replacements.sellerId = sellerId;
      }
      
      if (startDate) {
        whereClause += ' AND pp.created_at >= :startDate';
        replacements.startDate = startDate;
      }
      
      if (endDate) {
        whereClause += ' AND pp.created_at <= :endDate';
        replacements.endDate = endDate;
      }

      // Métricas generales de vendedores
      const generalMetrics = await this._getGeneralSellerMetrics(whereClause, replacements);
      
      // Top vendedores por productos
      const topByProducts = await this._getTopSellersByProducts(whereClause, replacements);
      
      // Top vendedores por calificación
      const topByRating = await this._getTopSellersByRating(whereClause, replacements);
      
      // Vendedores más contactados
      const topByContacts = await this._getTopSellersByContacts(whereClause, replacements);

      return {
        general: generalMetrics[0],
        topByProducts,
        topByRating,
        topByContacts,
        filters: {
          sellerId: sellerId || null,
          startDate: startDate || null,
          endDate: endDate || null
        }
      };
    } catch (error) {
      Logger.error(`Error en getSellerMetrics: ${error.message}`, '[MetricsService]');
      throw error;
    }
  }

  /**
   * Obtener estadísticas consolidadas del sistema
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Object} Estadísticas consolidadas
   */
  static async getConsolidatedStats(filters = {}) {
    const { period = 'monthly', startDate, endDate } = filters;
    const days = this._getPeriodDays(period);

    // Estadísticas generales del sistema
    const systemStats = await this._getSystemStats();
    
    // Estadísticas de crecimiento
    const growthStats = await this._getGrowthStats(days);
    
    // Top categorías
    const topCategories = await this._getTopCategoriesStats();
    
    // Actividad reciente
    const recentActivity = await this._getRecentActivity(7); // Últimos 7 días

    // Agrupar estadísticas de crecimiento por tipo
    const growthByType = growthStats.reduce((acc, item) => {
      if (!acc[item.tipo]) {
        acc[item.tipo] = [];
      }
      acc[item.tipo].push({
        fecha: item.fecha,
        cantidad: item.nuevos
      });
      return acc;
    }, {});

    return {
      system: systemStats[0],
      growth: growthByType,
      topCategories,
      recentActivity,
      period,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Obtener dashboard de administrador
   * @returns {Object} Datos del dashboard
   */
  static async getAdminDashboard() {
    // KPIs principales
    const kpis = await this._getAdminKPIs();
    
    // Distribución por estado de pedidos
    const orderStatus = await this._getOrderStatusDistribution();
    
    // Actividad semanal
    const weeklyActivity = await this._getWeeklyActivity();

    return {
      kpis: kpis[0],
      orderStatus,
      weeklyActivity,
      generatedAt: new Date().toISOString()
    };
  }

  // Métodos privados para consultas específicas

  static async _getGeneralProductMetrics(whereClause, replacements) {
    const query = `
      SELECT 
        COUNT(*) as total_productos,
        COUNT(CASE WHEN p.activo = 1 THEN 1 END) as productos_activos,
        COUNT(CASE WHEN p.activo = 0 THEN 1 END) as productos_inactivos,
        COUNT(CASE WHEN p.destacado = 1 THEN 1 END) as productos_destacados,
        AVG(p.precio) as precio_promedio,
        MAX(p.precio) as precio_maximo,
        MIN(p.precio) as precio_minimo,
        SUM(p.vistas) as total_vistas,
        AVG(p.vistas) as promedio_vistas_por_producto
      FROM PRODUCTOS p
      WHERE 1=1 ${whereClause}
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getCategoryMetrics(whereClause, replacements) {
    const query = `
      SELECT 
        c.nombre as categoria,
        COUNT(p.id) as total_productos,
        AVG(p.precio) as precio_promedio,
        SUM(p.vistas) as total_vistas,
        COUNT(r.id) as total_resenias,
        AVG(r.calificacion) as rating_promedio
      FROM CATEGORIAS c
      LEFT JOIN PRODUCTOS p ON c.id = p.categoria_id ${whereClause.replace('WHERE 1=1', 'AND')}
      LEFT JOIN RESENIAS_PRODUCTO r ON p.id = r.producto_id AND r.activa = 1
      GROUP BY c.id, c.nombre
      ORDER BY total_productos DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getTopViewedProducts(whereClause, replacements) {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.vistas,
        c.nombre as categoria,
        pp.nombre_negocio as productor,
        COUNT(r.id) as total_resenias,
        AVG(r.calificacion) as rating_promedio
      FROM PRODUCTOS p
      LEFT JOIN CATEGORIAS c ON p.categoria_id = c.id
      LEFT JOIN PERFIL_PRODUCTOR pp ON p.perfil_productor_id = pp.id
      LEFT JOIN RESENIAS_PRODUCTO r ON p.id = r.producto_id AND r.activa = 1
      WHERE p.activo = 1 ${whereClause.replace('WHERE 1=1', 'AND')}
      GROUP BY p.id, p.nombre, p.precio, p.vistas, c.nombre, pp.nombre_negocio
      ORDER BY p.vistas DESC
      LIMIT 10
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getTopRatedProducts(whereClause, replacements) {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.vistas,
        c.nombre as categoria,
        pp.nombre_negocio as productor,
        COUNT(r.id) as total_resenias,
        AVG(r.calificacion) as rating_promedio
      FROM PRODUCTOS p
      LEFT JOIN CATEGORIAS c ON p.categoria_id = c.id
      LEFT JOIN PERFIL_PRODUCTOR pp ON p.perfil_productor_id = pp.id
      LEFT JOIN RESENIAS_PRODUCTO r ON p.id = r.producto_id AND r.activa = 1
      WHERE p.activo = 1 ${whereClause.replace('WHERE 1=1', 'AND')}
      GROUP BY p.id, p.nombre, p.precio, p.vistas, c.nombre, pp.nombre_negocio
      HAVING COUNT(r.id) >= 1
      ORDER BY rating_promedio DESC, total_resenias DESC
      LIMIT 10
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getGeneralSellerMetrics(whereClause, replacements) {
    const query = `
      SELECT 
        COUNT(*) as total_vendedores,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as vendedores_activos,
        COUNT(CASE WHEN verificado = 1 THEN 1 END) as vendedores_verificados,
        AVG(productos_count) as promedio_productos_por_vendedor,
        AVG(rating_promedio) as rating_promedio_general
      FROM (
        SELECT 
          pp.id,
          pp.activo,
          pp.verificado,
          COUNT(p.id) as productos_count,
          AVG(cr.calificacion) as rating_promedio
        FROM PERFIL_PRODUCTOR pp
        LEFT JOIN PRODUCTOS p ON pp.id = p.perfil_productor_id AND p.activo = 1
        LEFT JOIN CALIFICACIONES_VENDEDOR cr ON pp.id = cr.perfil_productor_id
        WHERE 1=1 ${whereClause}
        GROUP BY pp.id, pp.activo, pp.verificado
      ) as subquery
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getTopSellersByProducts(whereClause, replacements) {
    const query = `
      SELECT 
        pp.id,
        pp.nombre_negocio,
        pp.ubicacion,
        pp.verificado,
        u.email,
        COUNT(p.id) as total_productos,
        COUNT(CASE WHEN p.activo = 1 THEN 1 END) as productos_activos,
        SUM(p.vistas) as total_vistas,
        COUNT(c.id) as total_contactos,
        COUNT(cr.id) as total_calificaciones,
        AVG(cr.calificacion) as rating_promedio
      FROM PERFIL_PRODUCTOR pp
      LEFT JOIN users u ON pp.usuario_id = u.id
      LEFT JOIN PRODUCTOS p ON pp.id = p.perfil_productor_id
      LEFT JOIN CONTACTOS c ON pp.id = c.emprendedor_id
      LEFT JOIN CALIFICACIONES_VENDEDOR cr ON pp.id = cr.perfil_productor_id
      WHERE pp.activo = 1 ${whereClause.replace('WHERE 1=1', 'AND')}
      GROUP BY pp.id, pp.nombre_negocio, pp.ubicacion, pp.verificado, u.email
      ORDER BY total_productos DESC, productos_activos DESC
      LIMIT 10
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getTopSellersByRating(whereClause, replacements) {
    const query = `
      SELECT 
        pp.id,
        pp.nombre_negocio,
        pp.ubicacion,
        pp.verificado,
        u.email,
        COUNT(p.id) as total_productos,
        SUM(p.vistas) as total_vistas,
        COUNT(c.id) as total_contactos,
        COUNT(cr.id) as total_calificaciones,
        AVG(cr.calificacion) as rating_promedio
      FROM PERFIL_PRODUCTOR pp
      LEFT JOIN users u ON pp.usuario_id = u.id
      LEFT JOIN PRODUCTOS p ON pp.id = p.perfil_productor_id AND p.activo = 1
      LEFT JOIN CONTACTOS c ON pp.id = c.emprendedor_id
      LEFT JOIN CALIFICACIONES_VENDEDOR cr ON pp.id = cr.perfil_productor_id
      WHERE pp.activo = 1 ${whereClause.replace('WHERE 1=1', 'AND')}
      GROUP BY pp.id, pp.nombre_negocio, pp.ubicacion, pp.verificado, u.email
      HAVING COUNT(cr.id) >= 1
      ORDER BY rating_promedio DESC, total_calificaciones DESC
      LIMIT 10
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getTopSellersByContacts(whereClause, replacements) {
    const query = `
      SELECT 
        pp.id,
        pp.nombre_negocio,
        pp.ubicacion,
        pp.verificado,
        u.email,
        COUNT(p.id) as total_productos,
        SUM(p.vistas) as total_vistas,
        COUNT(c.id) as total_contactos,
        COUNT(CASE WHEN c.estado = 'respondido' THEN 1 END) as contactos_respondidos,
        ROUND((COUNT(CASE WHEN c.estado = 'respondido' THEN 1 END) / COUNT(c.id)) * 100, 2) as tasa_respuesta
      FROM PERFIL_PRODUCTOR pp
      LEFT JOIN users u ON pp.usuario_id = u.id
      LEFT JOIN PRODUCTOS p ON pp.id = p.perfil_productor_id AND p.activo = 1
      LEFT JOIN CONTACTOS c ON pp.id = c.emprendedor_id
      WHERE pp.activo = 1 ${whereClause.replace('WHERE 1=1', 'AND')}
      GROUP BY pp.id, pp.nombre_negocio, pp.ubicacion, pp.verificado, u.email
      HAVING COUNT(c.id) > 0
      ORDER BY total_contactos DESC, tasa_respuesta DESC
      LIMIT 10
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  static async _getSystemStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE isActive = 1) as usuarios_activos,
        (SELECT COUNT(*) FROM PERFIL_PRODUCTOR WHERE activo = 1) as emprendedores_activos,
        (SELECT COUNT(*) FROM PRODUCTOS WHERE activo = 1) as productos_activos,
        (SELECT COUNT(*) FROM CATEGORIAS WHERE activo = 1) as categorias_activas,
        (SELECT COUNT(*) FROM PEDIDOS) as total_pedidos,
        (SELECT COUNT(*) FROM CONTACTOS) as total_contactos,
        (SELECT COUNT(*) FROM RESENIAS_PRODUCTO WHERE activa = 1) as total_resenias,
        (SELECT COUNT(*) FROM CALIFICACIONES_VENDEDOR) as total_calificaciones_vendedor,
        (SELECT AVG(calificacion) FROM RESENIAS_PRODUCTO WHERE activa = 1) as rating_promedio_productos,
        (SELECT AVG(calificacion) FROM CALIFICACIONES_VENDEDOR) as rating_promedio_vendedores
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  static async _getGrowthStats(days) {
    const query = `
      SELECT 
        'usuarios' as tipo,
        COUNT(*) as nuevos,
        DATE(created_at) as fecha
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
      GROUP BY DATE(created_at)
      
      UNION ALL
      
      SELECT 
        'emprendedores' as tipo,
        COUNT(*) as nuevos,
        DATE(created_at) as fecha
      FROM PERFIL_PRODUCTOR 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
      GROUP BY DATE(created_at)
      
      UNION ALL
      
      SELECT 
        'productos' as tipo,
        COUNT(*) as nuevos,
        DATE(created_at) as fecha
      FROM PRODUCTOS 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
      GROUP BY DATE(created_at)
      
      ORDER BY fecha DESC, tipo
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { days }
    });
  }

  static async _getAdminKPIs() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE isActive = 1) as usuarios_activos,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as usuarios_nuevos_mes,
        (SELECT COUNT(*) FROM PERFIL_PRODUCTOR WHERE activo = 1) as emprendedores_activos,
        (SELECT COUNT(*) FROM PERFIL_PRODUCTOR WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as emprendedores_nuevos_mes,
        (SELECT COUNT(*) FROM PRODUCTOS WHERE activo = 1) as productos_activos,
        (SELECT COUNT(*) FROM PRODUCTOS WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as productos_nuevos_mes,
        (SELECT COALESCE(COUNT(*), 0) FROM PEDIDOS WHERE estado IN ('confirmado', 'enviado', 'entregado') AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as pedidos_mes,
        (SELECT COALESCE(SUM(total), 0) FROM PEDIDOS WHERE estado IN ('confirmado', 'enviado', 'entregado') AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as ingresos_estimados_mes
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  static async _getOrderStatusDistribution() {
    const query = `
      SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM PEDIDOS)), 2) as porcentaje
      FROM PEDIDOS
      GROUP BY estado
      ORDER BY cantidad DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  static async _getWeeklyActivity() {
    const query = `
      SELECT 
        DATE(fecha) as dia,
        SUM(usuarios) as nuevos_usuarios,
        SUM(productos) as nuevos_productos,
        SUM(pedidos) as nuevos_pedidos
      FROM (
        SELECT 
          created_at as fecha,
          1 as usuarios,
          0 as productos,
          0 as pedidos
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          created_at as fecha,
          0 as usuarios,
          1 as productos,
          0 as pedidos
        FROM PRODUCTOS 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          created_at as fecha,
          0 as usuarios,
          0 as productos,
          1 as pedidos
        FROM PEDIDOS 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ) as actividad
      GROUP BY DATE(fecha)
      ORDER BY dia DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  static async _getTopCategoriesStats() {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.descripcion,
        COUNT(p.id) as total_productos,
        COUNT(CASE WHEN p.activo = 1 THEN 1 END) as productos_activos,
        SUM(p.vistas) as total_vistas,
        AVG(p.precio) as precio_promedio,
        COUNT(r.id) as total_resenias,
        AVG(r.calificacion) as rating_promedio
      FROM CATEGORIAS c
      LEFT JOIN PRODUCTOS p ON c.id = p.categoria_id
      LEFT JOIN RESENIAS_PRODUCTO r ON p.id = r.producto_id AND r.activa = 1
      WHERE c.activo = 1
      GROUP BY c.id, c.nombre, c.descripcion
      HAVING total_productos > 0
      ORDER BY total_productos DESC, total_vistas DESC
      LIMIT 10
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  static async _getRecentActivity(days = 7) {
    const query = `
      SELECT * FROM (
        SELECT 
          created_at as fecha,
          1 as usuarios,
          0 as productos,
          0 as contactos
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        
        UNION ALL
        
        SELECT 
          created_at as fecha,
          0 as usuarios,
          1 as productos,
          0 as contactos
        FROM PRODUCTOS 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        
        UNION ALL
        
        SELECT 
          created_at as fecha,
          0 as usuarios,
          0 as productos,
          1 as contactos
        FROM CONTACTOS 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ) as actividad
      ORDER BY fecha DESC
      LIMIT 20
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: [days, days, days]
    });
  }

  static _getPeriodDays(period) {
    // Si es un número, devolverlo directamente
    if (typeof period === 'number') {
      return period;
    }
    
    // Si es un string, usar el mapeo tradicional
    const periodMap = {
      'daily': 1,
      'weekly': 7,
      'monthly': 30,
      'yearly': 365
    };
    return periodMap[period] || 30;
  }
}

export default MetricsService;
