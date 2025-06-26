import { logger } from '../../infrastructure/utils/logger.js';
import { SellerRating } from '../../models/index.js';

export class SellerRatingController {
  static async createSellerRating(req, res) {
    try {
      const { perfil_productor_id, calificacion, comentario } = req.body;
      const userId = req.user.id;

      // Validate rating range
      if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'La calificación debe estar entre 1 y 5'
        });
      }

      const rating = await SellerRating.create({
        usuario_id: userId,
        perfil_productor_id,
        calificacion,
        comentario
      });

      res.status(201).json({
        status: 'success',
        message: 'Calificación de vendedor creada exitosamente',
        data: rating
      });
    } catch (error) {
      logger.error('Error creating seller rating:', error);
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          status: 'error',
          message: 'Datos de calificación inválidos',
          details: error.errors.map(err => err.message)
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  static async getSellerRatings(req, res) {
    try {
      const ratings = await SellerRating.findAll();
      res.status(200).json({
        status: 'success',
        data: ratings
      });
    } catch (error) {
      logger.error('Error getting seller ratings:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}
