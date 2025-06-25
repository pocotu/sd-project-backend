import winston from 'winston';

// Configurar nivel de logging basado en el entorno
const logLevel = process.env.NODE_ENV === 'test' ? 'error' : (process.env.LOG_LEVEL || 'info');

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      // En tests, solo mostrar errores críticos
      silent: process.env.NODE_ENV === 'test' && process.env.SUPPRESS_TEST_LOGS === 'true'
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

export { logger }; 