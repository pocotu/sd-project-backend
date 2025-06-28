// Migration to create the PEDIDOS table for order management
'use strict';

const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PEDIDOS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      usuario_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      fecha_estimada_entrega: {
        type: Sequelize.DATE,
        allowNull: true
      },
      direccion_entrega: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notas_especiales: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telefono_contacto: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('PEDIDOS', ['usuario_id'], {
      name: 'idx_pedidos_usuario'
    });
    
    await queryInterface.addIndex('PEDIDOS', ['estado'], {
      name: 'idx_pedidos_estado'
    });
    
    await queryInterface.addIndex('PEDIDOS', ['created_at'], {
      name: 'idx_pedidos_created'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PEDIDOS');
  }
};

export default migration;
