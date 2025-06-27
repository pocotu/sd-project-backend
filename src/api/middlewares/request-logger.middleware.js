import { Logger } from '../../utils/logger.js';

// Middleware para loggear todas las peticiones HTTP
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log de petición entrante
  Logger.api(`${method} ${url} - IP: ${ip}`);
  
  // Interceptar la respuesta para loggear el resultado
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Determinar el tipo de log basado en el status code
    if (statusCode >= 500) {
      Logger.error('API', `${method} ${url} - ${statusCode} - ${duration}ms`);
    } else if (statusCode >= 400) {
      Logger.warn('API', `${method} ${url} - ${statusCode} - ${duration}ms`);
    } else {
      Logger.success('API', `${method} ${url} - ${statusCode} - ${duration}ms`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
