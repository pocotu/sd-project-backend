export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('IMAGENES_PRODUCTO', {
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
      nombre_archivo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      texto_alternativo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      es_principal: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tamano_bytes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tipo_mime: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('IMAGENES_PRODUCTO', ['producto_id'], { name: 'idx_imagenes_producto' });
    await queryInterface.addIndex('IMAGENES_PRODUCTO', ['orden'], { name: 'idx_imagenes_orden' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('IMAGENES_PRODUCTO');
  },
};
