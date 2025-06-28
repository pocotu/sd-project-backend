import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('USUARIO_ROLES', {
      usuario_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      rol_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      asignado_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Agregar índices
    await queryInterface.addIndex('USUARIO_ROLES', ['expires_at'], {
      name: 'idx_usuario_roles_expires'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('USUARIO_ROLES');
  }
};
