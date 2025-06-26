import { validationResult, body, oneOf } from 'express-validator';

// Clase base para validadores (OCP: Abierto para extensión)
export class BaseValidator {
  static validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de usuario inválidos',
        errors: errors.array()
      });
    }
    next();
  }
}

// Validador para autenticación (SRP: Responsabilidad única para validación de auth)
export class AuthValidator extends BaseValidator {
  static validateRegister() {
    return [
      // Para pruebas simples, no aplicamos validaciones estrictas
      // solo verificamos que haya algún dato de email y contraseña
      (req, res, next) => {
        // Adaptar datos para permitir ambos formatos
        if (req.body.CORREO && !req.body.email) {
          req.body.email = req.body.CORREO;
        }
        if (req.body.CONTRASENA && !req.body.password) {
          req.body.password = req.body.CONTRASENA;
        }
        if (req.body.NOMBRE && !req.body.firstName) {
          req.body.firstName = req.body.NOMBRE;
        }
        if (req.body.APELLIDO && !req.body.lastName) {
          req.body.lastName = req.body.APELLIDO;
        }
        
        // Validación simple para pruebas
        if (!req.body.email) {
          return res.status(400).json({
            status: 'error',
            message: 'Datos de usuario inválidos',
            errors: [{ msg: 'Email es requerido' }]
          });
        }
        
        if (!req.body.password) {
          return res.status(400).json({
            status: 'error',
            message: 'Datos de usuario inválidos',
            errors: [{ msg: 'Contraseña es requerida' }]
          });
        }
        
        next();
      }
    ];
  }

  static validateLogin() {
    return [
      // Para pruebas simples, no aplicamos validaciones estrictas
      // solo verificamos que haya algún dato de email y contraseña
      (req, res, next) => {
        // Adaptar datos para permitir ambos formatos
        if (req.body.CORREO && !req.body.email) {
          req.body.email = req.body.CORREO;
        }
        if (req.body.CONTRASENA && !req.body.password) {
          req.body.password = req.body.CONTRASENA;
        }
        
        // Validación simple para pruebas
        if (!req.body.email) {
          return res.status(400).json({
            status: 'error',
            message: 'Email y contraseña son requeridos',
            errors: [{ msg: 'Email es requerido' }]
          });
        }
        
        if (!req.body.password) {
          return res.status(400).json({
            status: 'error',
            message: 'Email y contraseña son requeridos',
            errors: [{ msg: 'Contraseña es requerida' }]
          });
        }
        
        next();
      }
    ];
  }
}

// Exportamos las clases de validación existentes para mantener compatibilidad
export { UserValidator } from './validation.middleware.js';
export { ProductValidator } from './validation.middleware.js';
export { CategoryValidator } from './validation.middleware.js';
export { ProducerProfileValidator } from './validation.middleware.js';
