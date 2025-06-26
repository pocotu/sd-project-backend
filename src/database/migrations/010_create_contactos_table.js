export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CONTACTOS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      emprendedor_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'PERFIL_PRODUCTOR',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuario_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      nombre_contacto: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      email_contacto: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      telefono_contacto: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'PRODUCTOS',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('nuevo', 'leido', 'respondido', 'cerrado'),
        allowNull: false,
        defaultValue: 'nuevo'
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
    
    await queryInterface.addIndex('CONTACTOS', ['emprendedor_id'], { name: 'idx_contactos_emprendedor' });
    await queryInterface.addIndex('CONTACTOS', ['producto_id'], { name: 'idx_contactos_producto' });
    await queryInterface.addIndex('CONTACTOS', ['estado'], { name: 'idx_contactos_estado' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('CONTACTOS');
  },
};
