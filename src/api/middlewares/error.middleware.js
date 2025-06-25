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
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    details: err.details || null
  });
};

// Función para manejar errores en producción (SRP: Responsabilidad única para producción)
const handleProductionError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      details: err.details || null
    });
  } else {
    logger.error('Error 💥', {
      error: err,
      stack: err.stack
    });

    res.status(500).json({
      status: 'error',
      message: 'Algo salió mal'
    });
  }
};

// Middleware principal de errores (OCP: Abierto para extensión)
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    handleDevelopmentError(err, res);
  } else {
    handleProductionError(err, res);
  }
};

