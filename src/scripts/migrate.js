const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  logging: console.log
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging
  }
);

// Ruta a las migraciones
const migrationsPath = path.join(__dirname, '..', 'database', 'migrations');

// Verificar conexión a la base de datos y ejecutar migraciones
async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Leer archivos de migración
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Ordenar para asegurar el orden correcto

    console.log(`Se encontraron ${migrationFiles.length} archivos de migración.`);

    // Crear tabla de migraciones si no existe
    await createMigrationsTable();

    // Obtener migraciones ya ejecutadas
    const executedMigrations = await getExecutedMigrations();
    console.log(`Migraciones ya ejecutadas: ${executedMigrations.length}`);

    // Ejecutar cada migración pendiente
    for (const migrationFile of migrationFiles) {
      if (executedMigrations.includes(migrationFile)) {
        console.log(`Migración ya ejecutada, omitiendo: ${migrationFile}`);
        continue;
      }

      console.log(`Ejecutando migración: ${migrationFile}`);
      
      try {
        // Importar el archivo de migración
        const migration = require(path.join(migrationsPath, migrationFile));
        
        // Ejecutar la migración
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        
        // Registrar la migración como ejecutada
        await recordMigration(migrationFile);
        
        console.log(`Migración completada: ${migrationFile}`);
      } catch (error) {
        console.error(`Error al ejecutar la migración ${migrationFile}:`, error);
        throw error;
      }
    }

    console.log('Todas las migraciones se ejecutaron correctamente.');
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
    throw error;
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
  }
}

// Crear tabla para registrar migraciones ejecutadas
async function createMigrationsTable() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
      }
    });
    console.log('Tabla SequelizeMeta creada correctamente.');
  } catch (error) {
    // Si la tabla ya existe, ignoramos el error
    if (error.name === 'SequelizeTableExistsError') {
      console.log('La tabla SequelizeMeta ya existe.');
    } else {
      console.error('Error al crear la tabla SequelizeMeta:', error);
      throw error;
    }
  }
}

// Obtener lista de migraciones ya ejecutadas
async function getExecutedMigrations() {
  try {
    const [results] = await sequelize.query('SELECT name FROM SequelizeMeta');
    return results.map(row => row.name);
  } catch (error) {
    console.error('Error al obtener migraciones ejecutadas:', error);
    return [];
  }
}

// Registrar una migración como ejecutada
async function recordMigration(migrationName) {
  try {
    await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
      replacements: [migrationName]
    });
    console.log(`Migración registrada: ${migrationName}`);
  } catch (error) {
    console.error(`Error al registrar la migración ${migrationName}:`, error);
    throw error;
  }
}

// Ejecutar las migraciones
runMigrations()
  .then(() => {
    console.log('Proceso de migración completado.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error en el proceso de migración:', err);
    process.exit(1);
  });
