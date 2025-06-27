import { Sequelize } from 'sequelize';
import { Logger } from '../utils/logger.js';
import config from './database.config.js';

class DatabaseConnection {
  constructor() {
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];
    
    Logger.database('Iniciando configuración de conexión...');
    Logger.database(`Entorno: ${env}`);
    Logger.database(`Host: ${dbConfig.host}`);
    Logger.database(`Base de datos: ${dbConfig.database}`);
    
    this.sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        define: dbConfig.define,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }

  async connect() {
    try {
      Logger.database('Estableciendo conexión con la base de datos...');
      await this.sequelize.authenticate();
      Logger.success('Database', 'Conexión establecida correctamente');
      Logger.database('Configuración del pool de conexiones:');
      Logger.database('  - Conexiones máximas: 5');
      Logger.database('  - Tiempo de adquisición: 30000ms');
      Logger.database('  - Tiempo de inactividad: 10000ms');
      return this.sequelize;
    } catch (error) {
      Logger.error('Database', 'Error en la conexión a la base de datos:');
      Logger.error('Database', `  - Mensaje: ${error.message}`);
      Logger.error('Database', `  - Código: ${error.code}`);
      Logger.error('Database', `  - Stack: ${error.stack}`);
      throw error;
    }
  }

  getInstance() {
    return this.sequelize;
  }
}

// Singleton instance
const databaseConnection = new DatabaseConnection();
export default databaseConnection.getInstance(); 