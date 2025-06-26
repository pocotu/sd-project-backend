export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PERFIL_PRODUCTOR', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre_negocio: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      facebook_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      instagram_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      tiktok_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      sitio_web: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      verificado: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        allowNull: false
      },
      activo: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1,
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
    
    await queryInterface.addIndex('PERFIL_PRODUCTOR', ['activo'], { name: 'idx_perfil_activo' });
    await queryInterface.addIndex('PERFIL_PRODUCTOR', ['verificado'], { name: 'idx_perfil_verificado' });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PERFIL_PRODUCTOR');
  }
};
