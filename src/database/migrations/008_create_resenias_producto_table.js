export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RESENIAS_PRODUCTO', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      calificacion: {
        type: Sequelize.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      verificada: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0
      },
      activa: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 1
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
    
    await queryInterface.addIndex('RESENIAS_PRODUCTO', ['producto_id'], { name: 'idx_resenias_producto' });
    await queryInterface.addIndex('RESENIAS_PRODUCTO', ['usuario_id'], { name: 'idx_resenias_usuario' });
    await queryInterface.addIndex('RESENIAS_PRODUCTO', ['activa'], { name: 'idx_resenias_activa' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('RESENIAS_PRODUCTO');
  },
};
