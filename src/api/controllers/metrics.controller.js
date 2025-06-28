import { Logger } from '../../utils/logger.js';
import { MetricsService } from '../../application/services/metrics.service.js';

/**
 * Controlador para métricas y estadísticas
 * Implementa APIs para consultar métricas de productos, vendedores y estadísticas consolidadas
 * Siguiendo principios SOLID: SRP (Single Responsibility), DIP (Dependency Inversion)
 */
class MetricsController {
  /**
   * Obtener métricas de productos
   */
  static async getProductMetrics(req, res) {
    try {
      Logger.info('Obteniendo métricas de productos', '[API]');
      
      const { productId, startDate, endDate, period = 'daily' } = req.query;
      
      // Validate date format
      if (startDate && startDate === 'invalid-date') {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido'
        });
      }
      
      // Validate period parameter - ahora incluye yearly
      const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
      if (period && !validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Período inválido. Use: daily, weekly, monthly, yearly'
        });
      }

      const filters = {
        productId: productId ? parseInt(productId) : undefined,
        startDate,
        endDate,
        period
      };

      const data = await MetricsService.getProductMetrics(filters);

      res.status(200).json({
        success: true,
        data
      });
      
      Logger.info('Métricas de productos obtenidas exitosamente', '[API]');
    } catch (error) {
      Logger.error(`Error al obtener métricas de productos: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener métricas de vendedores
   */
  static async getSellerMetrics(req, res) {
    try {
      Logger.info('Obteniendo métricas de vendedores', '[API]');
      
      const { sellerId, startDate, endDate } = req.query;
      
      const filters = {
        sellerId,
        startDate,
        endDate
      };

      const data = await MetricsService.getSellerMetrics(filters);

      res.status(200).json({
        success: true,
        data
      });
      
      Logger.info('Métricas de vendedores obtenidas exitosamente', '[API]');
    } catch (error) {
      Logger.error(`Error al obtener métricas de vendedores: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas consolidadas de emprendedores
   */
  static async getConsolidatedStats(req, res) {
    try {
      Logger.info('Obteniendo estadísticas consolidadas', '[API]');
      
      let { period, startDate, endDate } = req.query;
      
      // Set default period as numeric value when not specified
      if (!period) {
        period = 30; // Default to 30 days
      } else if (!isNaN(period)) {
        // Convert period to number if it's a numeric string
        period = parseInt(period);
      }
      
      // Validate period range for numeric values
      if (typeof period === 'number' && (period <= 0 || period > 365)) {
        return res.status(400).json({
          success: false,
          message: 'El período debe estar entre 1 y 365 días'
        });
      }
      
      const data = await MetricsService.getConsolidatedStats({
        period,
        startDate,
        endDate
      });

      res.status(200).json({
        success: true,
        data: {
          ...data,
          period // Return the processed period
        }
      });
      
      Logger.info('Estadísticas consolidadas obtenidas exitosamente', '[API]');
    } catch (error) {
      Logger.error(`Error al obtener estadísticas consolidadas: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener dashboard de administrador con métricas clave
   */
  static async getAdminDashboard(req, res) {
    try {
      Logger.info('Obteniendo dashboard de administrador', '[API]');

      const data = await MetricsService.getAdminDashboard();

      res.status(200).json({
        success: true,
        data
      });
      
      Logger.info('Dashboard de administrador obtenido exitosamente', '[API]');
    } catch (error) {
      Logger.error(`Error al obtener dashboard de administrador: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default MetricsController;
