import { Sequelize } from 'sequelize';
import config from './database.config.js';

class DatabaseConnection {
  constructor() {
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];
    
    console.log('\n[Database] Iniciando configuración de conexión...');
    console.log(`[Database] Entorno: ${env}`);
    console.log(`[Database] Host: ${dbConfig.host}`);
    console.log(`[Database] Base de datos: ${dbConfig.database}`);
    
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
      console.log('\n[Database] Estableciendo conexión con la base de datos...');
      await this.sequelize.authenticate();
      console.log('[Database] Conexión establecida correctamente');
      console.log('[Database] Configuración del pool de conexiones:');
      console.log('  - Conexiones máximas: 5');
      console.log('  - Tiempo de adquisición: 30000ms');
      console.log('  - Tiempo de inactividad: 10000ms\n');
      return this.sequelize;
    } catch (error) {
      console.error('\n[Database] Error en la conexión a la base de datos:');
      console.error(`  - Mensaje: ${error.message}`);
      console.error(`  - Código: ${error.code}`);
      console.error(`  - Stack: ${error.stack}\n`);
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