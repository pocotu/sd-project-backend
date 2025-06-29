import ExportReport from '../../models/ExportReport.js';
import { BaseRepository } from './base.repository.js';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para gestión de reportes de exportación
 * Siguiendo principios SOLID: SRP (Single Responsibility), DIP (Dependency Inversion)
 */
export class ExportReportRepository extends BaseRepository {
  constructor() {
    super(ExportReport);
  }

  /**
   * Obtener reportes de un usuario con paginación
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Reportes paginados
   */
  async findByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      return await this.model.findAndCountAll({
        where: { usuario_id: userId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['solicitado_at', 'DESC']]
      });
    } catch (error) {
      logger.error(`Error en findByUserId: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Obtener reportes pendientes (en estado 'generando')
   * @returns {Promise<Array>} Reportes pendientes
   */
  async findPendingReports() {
    try {
      return await this.model.findAll({
        where: { estado: 'generando' },
        order: [['solicitado_at', 'ASC']]
      });
    } catch (error) {
      logger.error(`Error en findPendingReports: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Marcar reporte como completado
   * @param {number} reportId - ID del reporte
   * @param {string} fileName - Nombre del archivo generado
   * @param {string} downloadUrl - URL de descarga
   * @returns {Promise<Object>} Reporte actualizado
   */
  async markAsCompleted(reportId, fileName, downloadUrl) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

      return await this.model.update({
        estado: 'completado',
        nombre_archivo: fileName,
        url_descarga: downloadUrl,
        completado_at: new Date(),
        expires_at: expiresAt
      }, {
        where: { id: reportId }
      });
    } catch (error) {
      logger.error(`Error en markAsCompleted: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Marcar reporte como error
   * @param {number} reportId - ID del reporte
   * @returns {Promise<Object>} Reporte actualizado
   */
  async markAsError(reportId) {
    try {
      return await this.model.update({
        estado: 'error',
        completado_at: new Date()
      }, {
        where: { id: reportId }
      });
    } catch (error) {
      logger.error(`Error en markAsError: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Eliminar reportes expirados
   * @returns {Promise<number>} Número de reportes eliminados
   */
  async deleteExpiredReports() {
    try {
      return await this.model.destroy({
        where: {
          expires_at: {
            [this.model.sequelize.Sequelize.Op.lt]: new Date()
          }
        }
      });
    } catch (error) {
      logger.error(`Error en deleteExpiredReports: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Crear solicitud de reporte
   * @param {Object} reportData - Datos del reporte
   * @returns {Promise<Object>} Reporte creado
   */
  async createReportRequest(reportData) {
    try {
      const { usuario_id, tipo_reporte, formato, parametros_filtro } = reportData;
      
      return await this.model.create({
        usuario_id,
        tipo_reporte,
        formato,
        parametros_filtro: JSON.stringify(parametros_filtro),
        estado: 'generando',
        solicitado_at: new Date()
      });
    } catch (error) {
      logger.error(`Error en createReportRequest: ${error.message}`, error);
      throw error;
    }
  }
}
