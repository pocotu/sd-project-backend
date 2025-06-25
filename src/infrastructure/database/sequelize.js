import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    DatabaseConnection.instance = this;
    this.sequelize = null;
  }

  getInstance() {
    if (!this.sequelize) {
      this.sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          dialect: 'mysql',
          logging: (msg) => logger.debug(msg),
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
        }
      );
    }
    return this.sequelize;
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      logger.info('Database connection has been established successfully.');
      return true;
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
      return false;
    }
  }

  async closeConnection() {
    if (this.sequelize) {
      await this.sequelize.close();
      logger.info('Database connection has been closed.');
    }
  }
}

export const databaseConnection = new DatabaseConnection();
export const sequelize = databaseConnection.getInstance(); 