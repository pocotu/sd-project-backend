import { InsigniaRepository } from '../../infrastructure/repositories/insignia.repository.js';
import { logger } from '../../infrastructure/utils/logger.js';
import sequelize from '../../config/database.js';

/**
 * Servicio para gestión de insignias y gamificación
 * Implementa la lógica de negocio para otorgar y gestionar insignias
 * Siguiendo principios SOLID: SRP, OCP, DIP
 */
export class InsigniaService {
  constructor() {
    this.insigniaRepository = new InsigniaRepository();
  }

  /**
   * Obtener todas las insignias disponibles
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Object>} Lista de insignias
   */
  async getAllInsignias(options = {}) {
    try {
      const { tipo, activa = true } = options;
      
      let insignias;
      if (tipo) {
        insignias = await this.insigniaRepository.findByTipo(tipo);
      } else {
        insignias = await this.insigniaRepository.findActiveInsignias();
      }

      return {
        success: true,
        data: insignias.map(insignia => ({
          id: insignia.id,
          nombre: insignia.nombre,
          descripcion: insignia.descripcion,
          icono_url: insignia.icono_url,
          color_hex: insignia.color_hex,
          tipo: insignia.tipo,
          umbral_requerido: insignia.umbral_requerido,
          activa: insignia.activa,
          created_at: insignia.created_at
        }))
      };
    } catch (error) {
      logger.error(`Error obteniendo insignias: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener insignia específica
   * @param {number} insigniaId - ID de la insignia
   * @returns {Promise<Object>} Datos de la insignia
   */
  async getInsignia(insigniaId) {
    try {
      const insignia = await this.insigniaRepository.findById(insigniaId);
      
      if (!insignia) {
        throw new Error('Insignia no encontrada');
      }

      return {
        success: true,
        data: {
          id: insignia.id,
          nombre: insignia.nombre,
          descripcion: insignia.descripcion,
          icono_url: insignia.icono_url,
          color_hex: insignia.color_hex,
          tipo: insignia.tipo,
          umbral_requerido: insignia.umbral_requerido,
          activa: insignia.activa,
          created_at: insignia.created_at
        }
      };
    } catch (error) {
      logger.error(`Error obteniendo insignia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crear nueva insignia
   * @param {Object} insigniaData - Datos de la insignia
   * @returns {Promise<Object>} Insignia creada
   */
  async createInsignia(insigniaData) {
    try {
      const { nombre, descripcion, icono_url, color_hex, tipo, umbral_requerido } = insigniaData;

      // Validar datos
      this._validateInsigniaData(insigniaData);

      const insignia = await this.insigniaRepository.create({
        nombre,
        descripcion,
        icono_url,
        color_hex,
        tipo,
        umbral_requerido,
        activa: 1
      });

      return {
        success: true,
        message: 'Insignia creada exitosamente',
        data: {
          id: insignia.id,
          nombre: insignia.nombre,
          descripcion: insignia.descripcion,
          icono_url: insignia.icono_url,
          color_hex: insignia.color_hex,
          tipo: insignia.tipo,
          umbral_requerido: insignia.umbral_requerido,
          activa: insignia.activa
        }
      };
    } catch (error) {
      logger.error(`Error creando insignia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar insignia
   * @param {number} insigniaId - ID de la insignia
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Insignia actualizada
   */
  async updateInsignia(insigniaId, updateData) {
    try {
      const insignia = await this.insigniaRepository.findById(insigniaId);
      
      if (!insignia) {
        throw new Error('Insignia no encontrada');
      }

      // Validar datos si se proporcionan
      if (Object.keys(updateData).length > 0) {
        this._validateInsigniaData(updateData, false);
      }

      await this.insigniaRepository.update(insigniaId, updateData);
      
      const updatedInsignia = await this.insigniaRepository.findById(insigniaId);

      return {
        success: true,
        message: 'Insignia actualizada exitosamente',
        data: {
          id: updatedInsignia.id,
          nombre: updatedInsignia.nombre,
          descripcion: updatedInsignia.descripcion,
          icono_url: updatedInsignia.icono_url,
          color_hex: updatedInsignia.color_hex,
          tipo: updatedInsignia.tipo,
          umbral_requerido: updatedInsignia.umbral_requerido,
          activa: updatedInsignia.activa
        }
      };
    } catch (error) {
      logger.error(`Error actualizando insignia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Activar/Desactivar insignia
   * @param {number} insigniaId - ID de la insignia
   * @param {boolean} activa - Estado activo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async toggleInsignia(insigniaId, activa) {
    try {
      const insignia = await this.insigniaRepository.findById(insigniaId);
      
      if (!insignia) {
        throw new Error('Insignia no encontrada');
      }

      await this.insigniaRepository.update(insigniaId, { activa: activa ? 1 : 0 });

      return {
        success: true,
        message: `Insignia ${activa ? 'activada' : 'desactivada'} exitosamente`
      };
    } catch (error) {
      logger.error(`Error cambiando estado de insignia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener insignias de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Insignias del usuario
   */
  async getUserInsignias(userId) {
    try {
      // First check if user exists using a repository or model
      const { User } = await import('../../models/index.js');
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const userInsignias = await this.insigniaRepository.findUserInsignias(userId);

      return {
        success: true,
        data: userInsignias.map(ui => ({
          id: ui.id,
          insignia_id: ui.insignia.id,
          otorgada_at: ui.otorgada_at,
          razon_otorgamiento: ui.razon_otorgamiento,
          Insignia: {
            id: ui.insignia.id,
            nombre: ui.insignia.nombre,
            descripcion: ui.insignia.descripcion,
            icono_url: ui.insignia.icono_url,
            color_hex: ui.insignia.color_hex,
            tipo: ui.insignia.tipo
          }
        }))
      };
    } catch (error) {
      logger.error(`Error obteniendo insignias del usuario: ${error.message}`);
      throw error;
    }
  }

  /**
   * Otorgar insignia manualmente
   * @param {string} userId - ID del usuario
   * @param {number} insigniaId - ID de la insignia
   * @param {string} razon - Razón del otorgamiento
   * @returns {Promise<Object>} Resultado del otorgamiento
   */
  async grantInsignia(userId, insigniaId, razon = 'Otorgamiento manual') {
    try {
      await this.insigniaRepository.grantInsignia(userId, insigniaId, razon);

      return {
        success: true,
        message: 'Insignia asignada exitosamente'
      };
    } catch (error) {
      logger.error(`Error otorgando insignia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revocar insignia
   * @param {string} userId - ID del usuario
   * @param {number} insigniaId - ID de la insignia
   * @returns {Promise<Object>} Resultado de la revocación
   */
  async revokeInsignia(userId, insigniaId) {
    try {
      const revoked = await this.insigniaRepository.revokeInsignia(userId, insigniaId);
      
      if (revoked === 0) {
        throw new Error('El usuario no posee esta insignia');
      }

      return {
        success: true,
        message: 'Insignia revocada exitosamente'
      };
    } catch (error) {
      logger.error(`Error revocando insignia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar y otorgar insignias automáticamente
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Insignias otorgadas automáticamente
   */
  async checkAndGrantAutoInsignias(userId) {
    try {
      const insigniasOtorgadas = [];

      // Obtener estadísticas del usuario
      const userStats = await this._getUserStats(userId);
      
      // Obtener todas las insignias activas
      const todasInsignias = await this.insigniaRepository.findActiveInsignias();

      for (const insignia of todasInsignias) {
        // Verificar si ya tiene la insignia
        const hasInsignia = await this.insigniaRepository.userHasInsignia(userId, insignia.id);
        if (hasInsignia) continue;

        // Verificar si cumple los criterios
        const cumpleCriterios = await this._checkInsigniaCriteria(insignia, userStats);
        
        if (cumpleCriterios) {
          await this.insigniaRepository.grantInsignia(
            userId, 
            insignia.id, 
            'Otorgamiento automático por cumplir criterios'
          );
          insigniasOtorgadas.push(insignia);
        }
      }

      return {
        success: true,
        message: `${insigniasOtorgadas.length} insignias otorgadas automáticamente`,
        data: insigniasOtorgadas
      };
    } catch (error) {
      logger.error(`Error verificando insignias automáticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de insignias
   * @returns {Promise<Object>} Estadísticas generales
   */
  async getInsigniaStats() {
    try {
      const stats = await this.insigniaRepository.getInsigniaStats();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      logger.error(`Error obteniendo estadísticas de insignias: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar datos de insignia
   * @private
   */
  _validateInsigniaData(data, isCreate = true) {
    const { nombre, descripcion, tipo, umbral_requerido, color_hex } = data;
    
    if (isCreate) {
      if (!nombre || nombre.trim().length < 2) {
        throw new Error('El nombre es requerido y debe tener al menos 2 caracteres');
      }
      
      if (!descripcion || descripcion.trim().length < 10) {
        throw new Error('La descripción es requerida y debe tener al menos 10 caracteres');
      }
      
      if (!tipo || !['productos', 'valoraciones', 'ventas'].includes(tipo)) {
        throw new Error('Tipo de insignia inválido');
      }
      
      if (!umbral_requerido || umbral_requerido < 1) {
        throw new Error('El umbral requerido debe ser mayor a 0');
      }
    }

    if (color_hex && !/^#[0-9A-F]{6}$/i.test(color_hex)) {
      throw new Error('Color hexadecimal inválido');
    }

    if (umbral_requerido !== undefined && umbral_requerido < 1) {
      throw new Error('El umbral requerido debe ser mayor a 0');
    }
  }

  /**
   * Obtener estadísticas del usuario para insignias
   * @private
   */
  async _getUserStats(userId) {
    try {
      // Consultar estadísticas del usuario
      const query = `
        SELECT 
          COUNT(DISTINCT p.id) as total_productos,
          COUNT(DISTINCT r.id) as total_valoraciones,
          AVG(r.calificacion) as promedio_valoraciones,
          COUNT(DISTINCT c.id) as total_contactos
        FROM users u
        LEFT JOIN PERFIL_PRODUCTOR pp ON u.id = pp.usuario_id
        LEFT JOIN PRODUCTOS p ON pp.id = p.perfil_productor_id AND p.activo = 1
        LEFT JOIN RESENIAS_PRODUCTO r ON p.id = r.producto_id AND r.activa = 1
        LEFT JOIN CONTACTOS c ON pp.id = c.emprendedor_id
        WHERE u.id = :userId
        GROUP BY u.id
      `;

      const [results] = await sequelize.query(query, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      return results || {
        total_productos: 0,
        total_valoraciones: 0,
        promedio_valoraciones: 0,
        total_contactos: 0
      };
    } catch (error) {
      logger.error(`Error obteniendo estadísticas del usuario: ${error.message}`);
      return {
        total_productos: 0,
        total_valoraciones: 0,
        promedio_valoraciones: 0,
        total_contactos: 0
      };
    }
  }

  /**
   * Verificar si el usuario cumple criterios para una insignia
   * @private
   */
  async _checkInsigniaCriteria(insignia, userStats) {
    try {
      switch (insignia.tipo) {
        case 'productos':
          return userStats.total_productos >= insignia.umbral_requerido;
        
        case 'valoraciones':
          return userStats.total_valoraciones >= insignia.umbral_requerido;
        
        case 'ventas':
          // Para ventas necesitaríamos implementar lógica de pedidos/ventas
          return false; // Por ahora deshabilitado
        
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Error verificando criterios de insignia: ${error.message}`);
      return false;
    }
  }
}
