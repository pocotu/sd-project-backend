import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('PERMISOS', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      accion: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      recurso: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Agregar índices
    await queryInterface.addIndex('PERMISOS', ['recurso'], {
      name: 'idx_permisos_recurso'
    });

    // Agregar restricción única compuesta
    await queryInterface.addIndex('PERMISOS', ['accion', 'recurso'], {
      unique: true,
      name: 'uk_permisos_accion_recurso'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('PERMISOS');
  }
};
