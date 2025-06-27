// Migration to create the CARRITO_ITEMS table aligned with mainProyectoDB.sql
'use strict';

const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CARRITO_ITEMS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      carrito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CARRITOS',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PRODUCTOS',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      agregado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('CARRITO_ITEMS', ['carrito_id'], { name: 'idx_carrito_items_carrito' });
    await queryInterface.addIndex('CARRITO_ITEMS', ['producto_id'], { name: 'idx_carrito_items_producto' });
    await queryInterface.addIndex('CARRITO_ITEMS', ['carrito_id', 'producto_id'], { 
      unique: true, 
      name: 'idx_carrito_items_unique' 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CARRITO_ITEMS');
  }
};

export default migration;
