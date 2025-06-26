const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CATEGORIAS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'CATEGORIAS',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      imagen_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      activo: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1,
        allowNull: false
      },
      orden: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('CATEGORIAS', ['activo'], { name: 'idx_categorias_activo' });
    await queryInterface.addIndex('CATEGORIAS', ['orden'], { name: 'idx_categorias_orden' });
  },
  
  down: async (queryInterface) => {
    await queryInterface.dropTable('CATEGORIAS');
  },
};

export default migration;