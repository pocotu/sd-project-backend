import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './api/middlewares/error.middleware.js';
import routes from './api/routes/index.js';
import { logger } from './infrastructure/utils/logger.js';

// Clase para configuración de Express (SRP)
class ExpressConfig {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    // Middleware de seguridad
    this.app.use(helmet());
    
    // Middleware de compresión
    this.app.use(compression());
    
    // Middleware para parsear JSON
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configuración de CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Middleware de logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  setupRoutes() {
    // Rutas de la API
    this.app.use('/api', routes);
    
    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  setupErrorHandling() {
    // Middleware de manejo de errores
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

// Crear instancia de la configuración
const expressConfig = new ExpressConfig();
const app = expressConfig.getApp();

export default app;
export { app }; 