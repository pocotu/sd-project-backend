export default {
  up: async (queryInterface, Sequelize) => {
    // Obtener el rol de admin
    const [adminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!adminRole) {
      throw new Error('Rol admin no encontrado. Ejecuta primero el seeder de roles.');
    }

    // Obtener todos los permisos
    const permissions = await queryInterface.sequelize.query(
      "SELECT id FROM PERMISOS",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (permissions.length === 0) {
      throw new Error('No se encontraron permisos. Ejecuta primero el seeder de permisos.');
    }

    // Crear las asignaciones rol-permiso
    const now = new Date();
    const rolePermissions = permissions.map(permission => ({
      rol_id: adminRole.id,
      permiso_id: permission.id,
      created_at: now
    }));

    await queryInterface.bulkInsert('ROL_PERMISOS', rolePermissions);

    console.log(`✅ Asignados ${permissions.length} permisos al rol admin`);
  },

  down: async (queryInterface, Sequelize) => {
    // Obtener el rol de admin
    const [adminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminRole) {
      await queryInterface.bulkDelete('ROL_PERMISOS', {
        rol_id: adminRole.id
      });
    }
  }
};
