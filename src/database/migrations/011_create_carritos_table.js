// Migration to create the CARRITOS table aligned with mainProyectoDB.sql
'use strict';

const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CARRITOS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      estado: {
        type: Sequelize.ENUM('activo', 'pendiente', 'completado', 'cancelado'),
        allowNull: false,
        defaultValue: 'activo'
      },
      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      actualizado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('CARRITOS', ['usuario_id'], { name: 'idx_carritos_usuario' });
    await queryInterface.addIndex('CARRITOS', ['estado'], { name: 'idx_carritos_estado' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CARRITOS');
  }
};

export default migration;
