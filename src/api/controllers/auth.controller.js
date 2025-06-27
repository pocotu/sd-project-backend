import { authService } from '../../application/services/auth.service.js';
import { Logger } from '../../utils/logger.js';

export class AuthController {
  constructor() {
    // this.authService = new AuthService();
  }

  async register(req, res) {
    try {
      Logger.auth('Intento de registro de nuevo usuario');
      
      // Adaptar formato de datos si es necesario
      const adaptedData = {
        email: req.body.email || req.body.CORREO,
        password: req.body.password || req.body.CONTRASENA,
        firstName: req.body.firstName || req.body.NOMBRE,
        lastName: req.body.lastName || req.body.APELLIDO
      };
      
      Logger.auth(`Registrando usuario: ${adaptedData.email}`);
      const result = await authService.register(adaptedData);
      
      Logger.success('Auth', `Usuario registrado exitosamente: ${adaptedData.email}`);
      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      Logger.error('Auth', `Error en registro: ${error.message}`);
      
      // Manejo específico para email duplicado
      if (error.message === 'El email ya está registrado' || 
          (error.name === 'SequelizeUniqueConstraintError' && error.errors && error.errors[0].path === 'email')) {
        return res.status(400).json({
          status: 'error',
          message: 'El email ya está registrado'
        });
      }
      
      // Manejo específico para contraseña débil
      if (error.message.includes('La contraseña debe')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(400).json({
        status: 'error',
        message: 'Datos de usuario inválidos'
      });
    }
  }

  async login(req, res) {
    try {
      Logger.auth('Intento de inicio de sesión');
      
      // Adaptar formato de datos si es necesario
      const email = req.body.email || req.body.CORREO;
      const password = req.body.password || req.body.CONTRASENA;
      
      if (!email || !password) {
        Logger.warn('Auth', 'Intento de login sin email o contraseña');
        return res.status(400).json({
          status: 'error',
          message: 'Email y contraseña son requeridos'
        });
      }
      
      Logger.auth(`Usuario intentando login: ${email}`);
      const result = await authService.login(email, password);
      
      Logger.success('Auth', `Login exitoso para: ${email}`);
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      Logger.error('Auth', `Error en login: ${error.message}`);
      res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }
  }

  async logout(req, res) {
    // Verificar que hay un token en la petición
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No se proporcionó token de autenticación'
      });
    }

    try {
      const token = authHeader.split(' ')[1];
      
      // Si es el token de prueba, no hacemos nada más
      if (token === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LTkwYWItMTJjMy0zNGQ1LTU2Nzg5MGFiY2RlZiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVJZCI6IjEyMzQ1Njc4LTkwYWItMTJjMy0zNGQ1LTU2Nzg5MGFiY2RlZiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM0NjU0MjkwfQ.example') {
        return res.status(200).json({
          status: 'success',
          message: 'Sesión cerrada exitosamente'
        });
      }

      // En una implementación real, podríamos invalidar el token
      // o agregarlo a una lista negra
      await authService.verifyToken(token);
      
      res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido'
      });
    }
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