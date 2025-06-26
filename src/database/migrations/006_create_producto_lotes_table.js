export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PRODUCTO_LOTES', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PRODUCTOS',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lote_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LOTES',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad_inicial: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      cantidad_actual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      cantidad_reservada: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('PRODUCTO_LOTES', ['producto_id'], { name: 'idx_producto_lotes_producto' });
    await queryInterface.addIndex('PRODUCTO_LOTES', ['lote_id'], { name: 'idx_producto_lotes_lote' });
    await queryInterface.addIndex('PRODUCTO_LOTES', ['cantidad_actual'], { name: 'idx_producto_lotes_cantidad' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('PRODUCTO_LOTES');
  },
};
