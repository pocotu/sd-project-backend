import { logger } from '../../infrastructure/utils/logger.js';

// Clase para errores operacionales (SRP: Responsabilidad única para manejo de errores)
export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Función para manejar errores en desarrollo (SRP: Responsabilidad única para desarrollo)
const handleDevelopmentError = (err, res) => {
  logger.error('Error 💥', {
    error: err,
    stack: err.stack
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    details: err.details || null
  });
};

// Función para manejar errores en producción (SRP: Responsabilidad única para producción)
const handleProductionError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || null
    });
  } else {
    logger.error('Error 💥', {
      error: err,
      stack: err.stack
    });

    res.status(500).json({
      success: false,
      message: 'Algo salió mal'
    });
  }
};

// Middleware principal de errores (OCP: Abierto para extensión)
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Añadir el status en el formato esperado por los tests
  const response = {
    success: false,
    status: 'error',
    message: err.message,
    details: err.details || null
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

export class ErrorMiddleware {
  static handle(err, req, res, next) {
    logger.error('Error:', err);

    // Si estamos en modo de prueba, incluir más detalles del error
    const isTestEnvironment = process.env.NODE_ENV === 'test';
    
    const error = {
      success: false,
      message: err.message || 'Error interno del servidor',
      ...(isTestEnvironment && {
        stack: err.stack,
        name: err.name,
        code: err.code
      })
    };

    // Determinar el código de estado HTTP apropiado
    let statusCode = err.statusCode || 500;

    // Manejar errores específicos
    if (err.name === 'ValidationError') {
      statusCode = 400;
    } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
      statusCode = 401;
    } else if (err.name === 'ForbiddenError') {
      statusCode = 403;
    } else if (err.name === 'NotFoundError') {
      statusCode = 404;
    }

    res.status(statusCode).json(error);
  }
}

