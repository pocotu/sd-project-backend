import { sequelize } from '../models/index.js';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const umzug = new Umzug({
  migrations: {
    glob: '../database/migrations/*.js',
    resolve: ({ name, path: migrationPath, context }) => {
      const module = import(migrationPath);
      return module.then((m) => m.default);
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function runNewMigrations() {
  try {
    console.log('🔄 Ejecutando nuevas migraciones...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Obtener migraciones pendientes
    const pending = await umzug.pending();
    console.log(`📄 Migraciones pendientes: ${pending.length}`);
    
    if (pending.length === 0) {
      console.log('✅ No hay migraciones pendientes');
      return;
    }
    
    // Ejecutar solo las nuevas migraciones (015 en adelante)
    const newMigrations = pending.filter(migration => {
      const name = migration.name;
      const number = parseInt(name.split('_')[0]);
      return number >= 15;
    });
    
    console.log(`🔄 Ejecutando ${newMigrations.length} migraciones nuevas...`);
    
    for (const migration of newMigrations) {
      console.log(`⏳ Ejecutando: ${migration.name}`);
      await umzug.up({ to: migration.name });
      console.log(`✅ Completada: ${migration.name}`);
    }
    
    console.log('🎉 Todas las migraciones nuevas ejecutadas exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

runNewMigrations();
