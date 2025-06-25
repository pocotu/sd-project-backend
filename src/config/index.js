import dotenv from 'dotenv';
import { logger } from '../infrastructure/utils/logger.js';

dotenv.config();

// Clase para manejo de configuración (SRP)
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    Config.instance = this;
    this.validateConfig();
  }

  validateConfig() {
    const requiredEnvVars = [
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'DB_HOST',
      'DB_PORT',
      'JWT_SECRET',
      'JWT_EXPIRES_IN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error('Missing required environment variables:', missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
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
      expiresIn: process.env.JWT_EXPIRES_IN
    };
  }

  get server() {
    return {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development'
    };
  }

  get logging() {
    return {
      level: process.env.LOG_LEVEL || 'info'
    };
  }

  get cors() {
    return {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    };
  }
}

// Singleton para la configuración
export const config = new Config(); 