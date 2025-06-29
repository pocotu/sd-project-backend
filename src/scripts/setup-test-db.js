import { Sequelize } from 'sequelize';
import { config } from '../config/database.config.js';
import sequelize from '../config/database.js';
import Role from '../models/Role.js';
import Permiso from '../models/Permiso.js';
import RolPermisos from '../models/RolPermisos.js';
import { logger } from '../infrastructure/utils/logger.js';

async function setupTestDatabase() {
  try {
    console.log('🔄 Setting up test database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Force sync to ensure fresh state
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Create default roles
    const roles = [
      { nombre: 'usuario', descripcion: 'Usuario regular del sistema' },
      { nombre: 'productor', descripcion: 'Usuario productor que puede vender productos' },
      { nombre: 'administrador', descripcion: 'Administrador del sistema' }
    ];

    for (const roleData of roles) {
      await Role.create(roleData);
      console.log(`✅ Role created: ${roleData.nombre}`);
    }

    // Create default permissions
    const permissions = [
      { nombre: 'ver_reportes', descripcion: 'Ver reportes de exportación' },
      { nombre: 'crear_reportes', descripcion: 'Crear reportes de exportación' },
      { nombre: 'descargar_reportes', descripcion: 'Descargar reportes de exportación' },
      { nombre: 'administrar_sistema', descripcion: 'Administrar el sistema' }
    ];

    for (const permissionData of permissions) {
      await Permiso.create(permissionData);
      console.log(`✅ Permission created: ${permissionData.nombre}`);
    }

    // Assign permissions to roles
    const usuarioRole = await Role.findOne({ where: { nombre: 'usuario' } });
    const productorRole = await Role.findOne({ where: { nombre: 'productor' } });
    const adminRole = await Role.findOne({ where: { nombre: 'administrador' } });

    const verReportesPermission = await Permiso.findOne({ where: { nombre: 'ver_reportes' } });
    const crearReportesPermission = await Permiso.findOne({ where: { nombre: 'crear_reportes' } });
    const descargarReportesPermission = await Permiso.findOne({ where: { nombre: 'descargar_reportes' } });
    const administrarSistemaPermission = await Permiso.findOne({ where: { nombre: 'administrar_sistema' } });

    // Usuario role permissions
    await RolPermisos.create({ rolId: usuarioRole.id, permisoId: verReportesPermission.id });

    // Productor role permissions
    await RolPermisos.create({ rolId: productorRole.id, permisoId: verReportesPermission.id });
    await RolPermisos.create({ rolId: productorRole.id, permisoId: crearReportesPermission.id });
    await RolPermisos.create({ rolId: productorRole.id, permisoId: descargarReportesPermission.id });

    // Admin role permissions (all)
    await RolPermisos.create({ rolId: adminRole.id, permisoId: verReportesPermission.id });
    await RolPermisos.create({ rolId: adminRole.id, permisoId: crearReportesPermission.id });
    await RolPermisos.create({ rolId: adminRole.id, permisoId: descargarReportesPermission.id });
    await RolPermisos.create({ rolId: adminRole.id, permisoId: administrarSistemaPermission.id });

    console.log('✅ Role-permission assignments created');
    
    console.log('🎉 Test database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

// Run setup if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestDatabase()
    .then(() => {
      console.log('Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export { setupTestDatabase };
