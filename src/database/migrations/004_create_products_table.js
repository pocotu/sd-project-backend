const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PRODUCTOS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      perfil_productor_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'PERFIL_PRODUCTOR',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CATEGORIAS',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo: {
        type: Sequelize.ENUM('producto', 'servicio'),
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      unidad: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      meta_title: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      meta_keywords: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      activo: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1,
        allowNull: false
      },
      destacado: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        allowNull: false
      },
      vistas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
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
    
    await queryInterface.addIndex('PRODUCTOS', ['perfil_productor_id'], { name: 'idx_productos_perfil' });
    await queryInterface.addIndex('PRODUCTOS', ['categoria_id'], { name: 'idx_productos_categoria' });
    await queryInterface.addIndex('PRODUCTOS', ['activo'], { name: 'idx_productos_activo' });
    await queryInterface.addIndex('PRODUCTOS', ['destacado'], { name: 'idx_productos_destacado' });
    await queryInterface.addIndex('PRODUCTOS', ['tipo'], { name: 'idx_productos_tipo' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('PRODUCTOS');
  },
};

export default migration;