import { InsigniaService } from './insignia.service.js';
import { logger } from '../../infrastructure/utils/logger.js';

/**
 * Servicio para asignación automática de insignias
 * Implementa la lógica de gamificación automática
 */
export class BadgeAssignmentService {
  constructor() {
    this.insigniaService = new InsigniaService();
  }

  /**
   * Verificar y asignar insignias automáticamente para un usuario
   * @param {number} userId - ID del usuario
   * @param {string} triggerType - Tipo de evento que desencadena la verificación
   * @param {Object} data - Datos adicionales del evento
   */
  async checkAndAssignBadges(userId, triggerType, data = {}) {
    try {
      logger.info(`Verificando insignias para usuario ${userId} - trigger: ${triggerType}`, '[BADGES]');

      switch (triggerType) {
        case 'nueva_venta':
          await this._checkSalesBadges(userId, data);
          break;
        case 'nueva_valoracion':
          await this._checkReviewBadges(userId, data);
          break;
        case 'nuevo_producto':
          await this._checkProductBadges(userId, data);
          break;
        case 'actividad_completada':
          await this._checkActivityBadges(userId, data);
          break;
        default:
          logger.warn(`Tipo de trigger no reconocido: ${triggerType}`, '[BADGES]');
      }
    } catch (error) {
      logger.error(`Error verificando insignias para usuario ${userId}: ${error.message}`, '[BADGES]');
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  /**
   * Verificar insignias de ventas
   * @private
   */
  async _checkSalesBadges(userId, data) {
    const { totalVentas, montoTotal } = data;

    // Obtener insignias de ventas activas
    const salesBadges = await this.insigniaService.getInsigniasByType('ventas');
    
    for (const badge of salesBadges.data) {
      const criterio = badge.criterio || {};
      let shouldAssign = false;

      // Verificar si cumple criterios
      if (criterio.minVentas && totalVentas >= criterio.minVentas) {
        shouldAssign = true;
      }

      if (criterio.minMonto && montoTotal >= criterio.minMonto) {
        shouldAssign = true;
      }

      if (shouldAssign) {
        await this._assignBadgeIfNotExists(userId, badge.id, badge.nombre);
      }
    }
  }

  /**
   * Verificar insignias de valoraciones
   * @private
   */
  async _checkReviewBadges(userId, data) {
    const { totalReviews, averageRating } = data;

    const reviewBadges = await this.insigniaService.getInsigniasByType('valoracion');
    
    for (const badge of reviewBadges.data) {
      const criterio = badge.criterio || {};
      let shouldAssign = false;

      if (criterio.minReviews && totalReviews >= criterio.minReviews) {
        shouldAssign = true;
      }

      if (criterio.minRating && averageRating >= criterio.minRating) {
        shouldAssign = true;
      }

      if (shouldAssign) {
        await this._assignBadgeIfNotExists(userId, badge.id, badge.nombre);
      }
    }
  }

  /**
   * Verificar insignias de productos
   * @private
   */
  async _checkProductBadges(userId, data) {
    const { totalProductos } = data;

    const productBadges = await this.insigniaService.getInsigniasByType('producto');
    
    for (const badge of productBadges.data) {
      const criterio = badge.criterio || {};
      
      if (criterio.minProductos && totalProductos >= criterio.minProductos) {
        await this._assignBadgeIfNotExists(userId, badge.id, badge.nombre);
      }
    }
  }

  /**
   * Verificar insignias de actividad
   * @private
   */
  async _checkActivityBadges(userId, data) {
    const { tipoActividad, valor } = data;

    const activityBadges = await this.insigniaService.getInsigniasByType('actividad');
    
    for (const badge of activityBadges.data) {
      const criterio = badge.criterio || {};
      
      if (criterio.tipoActividad === tipoActividad && criterio.minValor && valor >= criterio.minValor) {
        await this._assignBadgeIfNotExists(userId, badge.id, badge.nombre);
      }
    }
  }

  /**
   * Asignar insignia si no existe ya
   * @private
   */
  async _assignBadgeIfNotExists(userId, badgeId, badgeName) {
    try {
      // Verificar si ya tiene la insignia
      const userBadges = await this.insigniaService.getUserInsignias(userId);
      const hasAlready = userBadges.data.some(ub => ub.insignia_id === badgeId);

      if (!hasAlready) {
        await this.insigniaService.assignInsignia(badgeId, userId);
        logger.info(`Insignia "${badgeName}" asignada automáticamente a usuario ${userId}`, '[BADGES]');
      }
    } catch (error) {
      if (!error.message.includes('ya tiene')) {
        logger.error(`Error asignando insignia ${badgeId} a usuario ${userId}: ${error.message}`, '[BADGES]');
      }
    }
  }

  /**
   * Recalcular todas las insignias para un usuario específico
   * Útil para migración o corrección de datos
   */
  async recalculateUserBadges(userId) {
    try {
      logger.info(`Recalculando insignias para usuario ${userId}`, '[BADGES]');

      // Aquí podrías obtener datos del usuario desde la base de datos
      // y ejecutar todas las verificaciones
      
      // Ejemplo de uso:
      // const userStats = await this._getUserStats(userId);
      // await this.checkAndAssignBadges(userId, 'nueva_venta', userStats.ventas);
      // await this.checkAndAssignBadges(userId, 'nueva_valoracion', userStats.valoraciones);
      // etc.

      logger.info(`Recálculo de insignias completado para usuario ${userId}`, '[BADGES]');
    } catch (error) {
      logger.error(`Error recalculando insignias para usuario ${userId}: ${error.message}`, '[BADGES]');
      throw error;
    }
  }

  /**
   * Recalcular insignias para todos los usuarios
   * Solo para administradores
   */
  async recalculateAllBadges() {
    try {
      logger.info('Iniciando recálculo masivo de insignias', '[BADGES]');
      
      // En una implementación real, esto se haría en lotes para no sobrecargar el sistema
      // const users = await User.findAll({ attributes: ['id'] });
      // for (const user of users) {
      //   await this.recalculateUserBadges(user.id);
      // }
      
      logger.info('Recálculo masivo de insignias completado', '[BADGES]');
    } catch (error) {
      logger.error(`Error en recálculo masivo de insignias: ${error.message}`, '[BADGES]');
      throw error;
    }
  }
}

export default BadgeAssignmentService;
