import { v4 as uuidv4 } from 'uuid';

export default {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      {
        id: uuidv4(),
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        activo: 1,
        created_at: new Date(),
      },
      {
        id: uuidv4(),
        nombre: 'productor',
        descripcion: 'Usuario productor',
        activo: 1,
        created_at: new Date(),
      },
      {
        id: uuidv4(),
        nombre: 'consumidor',
        descripcion: 'Usuario consumidor',
        activo: 1,
        created_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('roles', roles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ROLES', null, {});
  }
};
