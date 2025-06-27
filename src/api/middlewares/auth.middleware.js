import { authService } from '../../application/services/auth.service.js';
import { logger } from '../../infrastructure/utils/logger.js';

export class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'No se proporcionó token de autenticación'
        });
      }

      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = await authService.verifyToken(token);
        req.user = decoded;
        next();
      } catch (verifyError) {
        logger.error('Error verifying token:', verifyError);
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido o expirado'
        });
      }
    } catch (error) {
      logger.error('Error in auth middleware:', error);
      return res.status(401).json({
        status: 'error',
        message: error.message || 'Error de autenticación'
      });
    }
  }

  static authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'No autenticado'
        });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'No autorizado'
        });
      }

      next();
    };
  }
}

// Exporta la función compatible con Express para rutas y tests
export const authMiddleware = AuthMiddleware.authenticate;