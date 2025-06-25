import 'dotenv/config';
import app from './app.js';
import { logger } from './infrastructure/utils/logger.js';

const PORT = process.env.PORT || 3000;

// Clase para manejar el servidor (SRP: Responsabilidad única para el servidor)
class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT}`);
    });

    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    // Manejo de errores no capturados
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Cerrando...');
      logger.error(err.name, err.message);
      this.gracefulShutdown();
    });

    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Cerrando...');
      logger.error(err.name, err.message);
      this.gracefulShutdown();
    });
  }

  gracefulShutdown() {
    if (this.server) {
      this.server.close(() => {
        logger.info('Servidor cerrado correctamente');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
}

// Iniciar el servidor
const server = new Server();
server.start();

export default server; 