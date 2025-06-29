import { InsigniaService } from '../../application/services/insignia.service.js';
import { logger } from '../../infrastructure/utils/logger.js';

/**
 * Controlador para gestión de insignias y gamificación
 * Implementa endpoints REST para CRUD de insignias y gestión de otorgamientos
 * Siguiendo principios SOLID: SRP (Single Responsibility), DIP (Dependency Inversion)
 */
class InsigniaController {
  constructor() {
    this.insigniaService = new InsigniaService();
  }

  /**
   * Obtener todas las insignias
   * GET /api/insignias
   */
  async getAllInsignias(req, res) {
    try {
      const { tipo, activa } = req.query;

      logger.info('Obteniendo lista de insignias', '[API]');

      const result = await this.insigniaService.getAllInsignias({ tipo, activa });

      res.status(200).json(result);
      logger.info(`Insignias obtenidas: ${result.data.length}`, '[API]');
    } catch (error) {
      logger.error(`Error obteniendo insignias: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener insignia específica
   * GET /api/insignias/:id
   */
  async getInsignia(req, res) {
    try {
      const { id } = req.params;

      logger.info(`Obteniendo insignia con ID: ${id}`, '[API]');

      const result = await this.insigniaService.getInsignia(parseInt(id));

      res.status(200).json(result);
      logger.info(`Insignia encontrada: ${result.data.nombre}`, '[API]');
    } catch (error) {
      logger.error(`Error obteniendo insignia: ${error.message}`, '[API]');
      
      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Crear nueva insignia
   * POST /api/insignias
   */
  async createInsignia(req, res) {
    try {
      const { nombre, descripcion, icono_url, color_hex, tipo, umbral_requerido } = req.body;

      logger.info(`Creando nueva insignia: ${nombre}`, '[API]');

      const result = await this.insigniaService.createInsignia({
        nombre,
        descripcion,
        icono_url,
        color_hex,
        tipo,
        umbral_requerido
      });

      res.status(201).json(result);
      logger.info(`Insignia creada exitosamente: ${nombre}`, '[API]');
    } catch (error) {
      logger.error(`Error creando insignia: ${error.message}`, '[API]');
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
          success: false,
          message: 'Ya existe una insignia con ese nombre'
        });
      } else if (error.message.includes('inválido') || error.message.includes('requerido')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Actualizar insignia
   * PUT /api/insignias/:id
   */
  async updateInsignia(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      logger.info(`Actualizando insignia con ID: ${id}`, '[API]');

      const result = await this.insigniaService.updateInsignia(parseInt(id), updateData);

      res.status(200).json(result);
      logger.info(`Insignia actualizada exitosamente: ${id}`, '[API]');
    } catch (error) {
      logger.error(`Error actualizando insignia: ${error.message}`, '[API]');
      
      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes('inválido') || error.message.includes('requerido')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Activar/Desactivar insignia
   * PATCH /api/insignias/:id/toggle
   */
  async toggleInsignia(req, res) {
    try {
      const { id } = req.params;
      const { activa } = req.body;

      logger.info(`Cambiando estado de insignia ${id} a ${activa}`, '[API]');

      const result = await this.insigniaService.toggleInsignia(parseInt(id), activa);

      res.status(200).json(result);
      logger.info(`Estado de insignia ${id} cambiado exitosamente`, '[API]');
    } catch (error) {
      logger.error(`Error cambiando estado de insignia: ${error.message}`, '[API]');
      
      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Obtener insignias de un usuario
   * GET /api/insignias/users/:userId
   */
  async getUserInsignias(req, res) {
    try {
      const { userId } = req.params;

      logger.info(`Obteniendo insignias del usuario ${userId}`, '[API]');

      const result = await this.insigniaService.getUserInsignias(userId);

      res.status(200).json(result);
      logger.info(`Insignias del usuario ${userId} obtenidas: ${result.data.length}`, '[API]');
    } catch (error) {
      logger.error(`Error obteniendo insignias del usuario: ${error.message}`, '[API]');
      
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Obtener mis insignias (usuario autenticado)
   * GET /api/insignias/my
   */
  async getMyInsignias(req, res) {
    try {
      const userId = req.user.id;

      logger.info(`Obteniendo insignias del usuario autenticado ${userId}`, '[API]');

      const result = await this.insigniaService.getUserInsignias(userId);

      res.status(200).json(result);
      logger.info(`Insignias propias obtenidas: ${result.data.length}`, '[API]');
    } catch (error) {
      logger.error(`Error obteniendo insignias propias: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Otorgar insignia manualmente
   * POST /api/insignias/grant
   */
  async grantInsignia(req, res) {
    try {
      const { usuario_id, insignia_id, razon } = req.body;

      logger.info(`Otorgando insignia ${insignia_id} a usuario ${usuario_id}`, '[API]');

      const result = await this.insigniaService.grantInsignia(usuario_id, insignia_id, razon);

      res.status(201).json(result);
      logger.info(`Insignia ${insignia_id} otorgada exitosamente a usuario ${usuario_id}`, '[API]');
    } catch (error) {
      logger.error(`Error otorgando insignia: ${error.message}`, '[API]');
      
      if (error.message.includes('ya posee') || error.message.includes('no encontrada')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Revocar insignia
   * DELETE /api/insignias/revoke
   */
  async revokeInsignia(req, res) {
    try {
      const { usuario_id, insignia_id } = req.body;

      logger.info(`Revocando insignia ${insignia_id} de usuario ${usuario_id}`, '[API]');

      const result = await this.insigniaService.revokeInsignia(usuario_id, insignia_id);

      res.status(200).json(result);
      logger.info(`Insignia ${insignia_id} revocada exitosamente de usuario ${usuario_id}`, '[API]');
    } catch (error) {
      logger.error(`Error revocando insignia: ${error.message}`, '[API]');
      
      if (error.message.includes('no posee')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  /**
   * Verificar y otorgar insignias automáticamente
   * POST /api/insignias/check-auto/:userId
   */
  async checkAutoInsignias(req, res) {
    try {
      const { userId } = req.params;

      logger.info(`Verificando insignias automáticas para usuario ${userId}`, '[API]');

      const result = await this.insigniaService.checkAndGrantAutoInsignias(userId);

      res.status(200).json(result);
      logger.info(`Verificación automática completada para usuario ${userId}`, '[API]');
    } catch (error) {
      logger.error(`Error verificando insignias automáticas: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Verificar mis insignias automáticas (usuario autenticado)
   * POST /api/insignias/check-my-auto
   */
  async checkMyAutoInsignias(req, res) {
    try {
      const userId = req.user.id;

      logger.info(`Verificando insignias automáticas para usuario autenticado ${userId}`, '[API]');

      const result = await this.insigniaService.checkAndGrantAutoInsignias(userId);

      res.status(200).json(result);
      logger.info(`Verificación automática propia completada para usuario ${userId}`, '[API]');
    } catch (error) {
      logger.error(`Error verificando insignias automáticas propias: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de insignias
   * GET /api/insignias/stats
   */
  async getInsigniaStats(req, res) {
    try {
      logger.info('Obteniendo estadísticas de insignias', '[API]');

      const result = await this.insigniaService.getInsigniaStats();

      res.status(200).json(result);
      logger.info('Estadísticas de insignias obtenidas exitosamente', '[API]');
    } catch (error) {
      logger.error(`Error obteniendo estadísticas de insignias: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener tipos de insignias disponibles
   * GET /api/insignias/types
   */
  async getInsigniaTypes(req, res) {
    try {
      const types = [
        {
          tipo: 'productos',
          nombre: 'Productos',
          descripcion: 'Insignias basadas en cantidad de productos creados'
        },
        {
          tipo: 'valoraciones',
          nombre: 'Valoraciones',
          descripcion: 'Insignias basadas en valoraciones recibidas'
        },
        {
          tipo: 'ventas',
          nombre: 'Ventas',
          descripcion: 'Insignias basadas en ventas realizadas'
        }
      ];

      res.status(200).json({
        success: true,
        data: types
      });
    } catch (error) {
      logger.error(`Error obteniendo tipos de insignias: ${error.message}`, '[API]');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default InsigniaController;
