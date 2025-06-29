import Insignia from '../../models/Insignia.js';
import UsuarioInsignia from '../../models/UsuarioInsignia.js';
import User from '../../models/User.js';
import { BaseRepository } from './base.repository.js';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para gestión de insignias
 * Siguiendo principios SOLID: SRP (Single Responsibility), DIP (Dependency Inversion)
 */
export class InsigniaRepository extends BaseRepository {
  constructor() {
    super(Insignia);
  }

  /**
   * Obtener todas las insignias activas
   * @returns {Promise<Array>} Insignias activas
   */
  async findActiveInsignias() {
    try {
      return await this.model.findAll({
        where: { activa: 1 },
        order: [['tipo', 'ASC'], ['umbral_requerido', 'ASC']]
      });
    } catch (error) {
      logger.error(`Error en findActiveInsignias: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Obtener insignias por tipo
   * @param {string} tipo - Tipo de insignia
   * @returns {Promise<Array>} Insignias del tipo especificado
   */
  async findByTipo(tipo) {
    try {
      return await this.model.findAll({
        where: { 
          tipo,
          activa: 1 
        },
        order: [['umbral_requerido', 'ASC']]
      });
    } catch (error) {
      logger.error(`Error en findByTipo: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Obtener insignias de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Insignias del usuario
   */
  async findUserInsignias(userId) {
    try {
      return await UsuarioInsignia.findAll({
        where: { usuario_id: userId },
        include: [
          {
            model: Insignia,
            as: 'insignia',
            where: { activa: 1 },
            attributes: ['id', 'nombre', 'descripcion', 'icono_url', 'color_hex', 'tipo']
          }
        ],
        order: [['otorgada_at', 'DESC']]
      });
    } catch (error) {
      logger.error(`Error en findUserInsignias: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Verificar si un usuario tiene una insignia específica
   * @param {string} userId - ID del usuario
   * @param {number} insigniaId - ID de la insignia
   * @returns {Promise<boolean>} True si el usuario tiene la insignia
   */
  async userHasInsignia(userId, insigniaId) {
    try {
      const count = await UsuarioInsignia.count({
        where: { 
          usuario_id: userId,
          insignia_id: insigniaId 
        }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error en userHasInsignia: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Otorgar insignia a usuario
   * @param {string} userId - ID del usuario
   * @param {number} insigniaId - ID de la insignia
   * @param {string} razon - Razón del otorgamiento
   * @returns {Promise<Object>} Insignia otorgada
   */
  async grantInsignia(userId, insigniaId, razon) {
    try {
      // Verificar si ya tiene la insignia
      const hasInsignia = await this.userHasInsignia(userId, insigniaId);
      if (hasInsignia) {
        throw new Error('El usuario ya posee esta insignia');
      }

      // Verificar que la insignia existe y está activa
      const insignia = await this.model.findOne({
        where: { 
          id: insigniaId,
          activa: 1 
        }
      });

      if (!insignia) {
        throw new Error('Insignia no encontrada o inactiva');
      }

      // Otorgar la insignia
      return await UsuarioInsignia.create({
        usuario_id: userId,
        insignia_id: insigniaId,
        razon_otorgamiento: razon,
        otorgada_at: new Date()
      });
    } catch (error) {
      logger.error(`Error en grantInsignia: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Revocar insignia de usuario
   * @param {string} userId - ID del usuario
   * @param {number} insigniaId - ID de la insignia
   * @returns {Promise<number>} Número de insignias revocadas
   */
  async revokeInsignia(userId, insigniaId) {
    try {
      return await UsuarioInsignia.destroy({
        where: { 
          usuario_id: userId,
          insignia_id: insigniaId 
        }
      });
    } catch (error) {
      logger.error(`Error en revokeInsignia: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de insignias
   * @returns {Promise<Object>} Estadísticas de insignias
   */
  async getInsigniaStats() {
    try {
      const totalInsignias = await this.model.count({ where: { activa: 1 } });
      const totalOtorgadas = await UsuarioInsignia.count();
      const usuariosConInsignias = await UsuarioInsignia.count({
        distinct: true,
        col: 'usuario_id'
      });

      const insigniasPorTipo = await this.model.findAll({
        where: { activa: 1 },
        attributes: [
          'tipo',
          [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'total']
        ],
        group: ['tipo']
      });

      return {
        totalInsignias,
        totalOtorgadas,
        usuariosConInsignias,
        insigniasPorTipo
      };
    } catch (error) {
      logger.error(`Error en getInsigniaStats: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Obtener usuarios elegibles para una insignia específica
   * @param {number} insigniaId - ID de la insignia
   * @returns {Promise<Array>} Usuarios elegibles
   */
  async findEligibleUsers(insigniaId) {
    try {
      const insignia = await this.model.findByPk(insigniaId);
      if (!insignia) {
        throw new Error('Insignia no encontrada');
      }

      // Esta lógica se puede extender según el tipo de insignia
      // Por ahora retorna una estructura base
      return [];
    } catch (error) {
      logger.error(`Error en findEligibleUsers: ${error.message}`, error);
      throw error;
    }
  }
}
