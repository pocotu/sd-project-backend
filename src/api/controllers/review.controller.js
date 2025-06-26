import { logger } from '../../infrastructure/utils/logger.js';
import { Review } from '../../models/index.js';

export class ReviewController {
  static async createReview(req, res) {
    try {
      const { producto_id, calificacion, comentario } = req.body;
      const userId = req.user.id;

      const review = await Review.create({
        producto_id,
        usuario_id: userId,
        calificacion,
        comentario
      });

      res.status(201).json({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: review
      });
    } catch (error) {
      logger.error('Error creating review:', error);
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          status: 'error',
          message: 'Datos de reseña inválidos',
          details: error.errors.map(err => err.message)
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  static async getReviews(req, res) {
    try {
      const reviews = await Review.findAll();
      res.status(200).json({
        status: 'success',
        data: reviews
      });
    } catch (error) {
      logger.error('Error getting reviews:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}
