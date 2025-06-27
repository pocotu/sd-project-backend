import dotenv from 'dotenv';
import { logger } from '../infrastructure/utils/logger.js';

// Forzar que .env sobrescriba variables de entorno existentes
dotenv.config({ override: true });

// Clase para manejo de configuración (SRP)
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    Config.instance = this;
    this.defaults = this.getDefaults();
    this.validateConfig();
  }

  getDefaults() {
    return {
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      CORS_ORIGIN: '*',
      JWT_EXPIRES_IN: '24h'
    };
  }

  validateConfig() {
    const requiredEnvVars = [
      'PORT',
      'DB_NAME',
      'DB_USER', 
      'DB_PASSWORD',
      'DB_HOST',
      'DB_PORT',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error('Missing required environment variables:', missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validar que el puerto sea un número válido si está definido
    if (process.env.PORT) {
      const port = parseInt(process.env.PORT);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid port number: ${process.env.PORT}. Port must be between 1 and 65535.`);
      }
    }
  }

  get database() {
    return {
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    };
  }

  get jwt() {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || this.defaults.JWT_EXPIRES_IN
    };
  }

  get server() {
    if (!process.env.PORT) {
      throw new Error('PORT must be defined in .env file');
    }
    const port = parseInt(process.env.PORT);
    return {
      port: port,
      env: process.env.NODE_ENV || this.defaults.NODE_ENV
    };
  }

  get logging() {
    return {
      level: process.env.LOG_LEVEL || this.defaults.LOG_LEVEL
    };
  }

  get cors() {
    return {
      origin: process.env.CORS_ORIGIN || this.defaults.CORS_ORIGIN,
      credentials: true
    };
  }

  get jwt() {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || this.defaults.JWT_EXPIRES_IN
    };
  }

  // Método para obtener toda la configuración de una vez
  getAll() {
    return {
      database: this.database,
      server: this.server,
      jwt: this.jwt,
      logging: this.logging,
      cors: this.cors
    };
  }
}

// Singleton para la configuración
export const config = new Config(); 