import 'dotenv/config';
import { Logger } from './utils/logger.js';

/**
 * Validación simple de configuración (SRP)
 */
function validateBasicConfig() {
  const required = ['PORT', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    Logger.error('Server', `Variables de entorno faltantes: ${missing.join(', ')}`);
    Logger.error('Server', 'Verifica tu archivo .env');
    return false;
  }
  return true;
}

/**
 * Función principal de inicio (SRP)
 */
async function startServer() {
  try {
    Logger.backend('🚀 Iniciando aplicación...');
    
    // Validación básica
    if (!validateBasicConfig()) {
      process.exit(1);
    }
    Logger.backend('✅ Variables de entorno validadas');
    
    // Cargar configuración
    const { config } = await import('./config/index.js');
    Logger.backend('✅ Configuración cargada exitosamente');
    
    const PORT = config.server.port;
    Logger.server(`Puerto configurado: ${PORT}`);
    
    // Cargar aplicación
    const app = await import('./app.js');
    Logger.backend('✅ Aplicación importada');
    
    // Iniciar servidor
    const server = app.default.listen(PORT, () => {
      Logger.success('Server', `Servidor corriendo en el puerto ${PORT}`);
      Logger.backend('🎉 Aplicación lista para recibir peticiones');
    });
    
    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        Logger.error('Server', `Puerto ${PORT} ya está en uso`);
        process.exit(1);
      } else {
        Logger.error('Server', `Error del servidor: ${error.message}`);
        process.exit(1);
      }
    });
    
  } catch (error) {
    Logger.error('Backend', `Error al iniciar: ${error.message}`);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();
