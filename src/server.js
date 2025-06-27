import 'dotenv/config';
import { Logger } from './utils/logger.js';

try {
  Logger.backend('Iniciando aplicación...');
  
  const { config } = await import('./config/index.js');
  Logger.backend('Configuración cargada exitosamente');
  
  const PORT = config.server.port;
  Logger.server(`Puerto configurado: ${PORT}`);
  
  const app = await import('./app.js');
  Logger.backend('Aplicación importada');
  
  const server = app.default.listen(PORT, () => {
    Logger.success('Server', `Servidor corriendo en el puerto ${PORT}`);
    Logger.backend('🚀 Aplicación lista para recibir peticiones');
  });
  
} catch (error) {
  Logger.error('Backend', `Error al iniciar: ${error.message}`);
  console.error('Stack:', error.stack);
  process.exit(1);
}
