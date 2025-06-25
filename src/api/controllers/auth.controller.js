import { authService } from '../../application/services/auth.service.js';

export class AuthController {
  constructor() {
    // this.authService = new AuthService();
  }

  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      // Manejo específico para email duplicado
      if (error.name === 'SequelizeUniqueConstraintError' && error.errors && error.errors[0].path === 'email') {
        return res.status(400).json({
          status: 'error',
          message: 'El email ya está registrado'
        });
      }
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async logout(req, res) {
    // En una implementación real, podríamos invalidar el token
    // o agregarlo a una lista negra
    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada exitosamente'
    });
  }

  async forgotPassword(req, res) {
    res.status(501).json({
      status: 'error',
      message: 'Endpoint en construcción'
    });
  }

  async resetPassword(req, res) {
    res.status(501).json({
      status: 'error',
      message: 'Endpoint en construcción'
    });
  }
} 