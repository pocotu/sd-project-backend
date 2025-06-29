// Migration to create the INSIGNIAS and USUARIO_INSIGNIAS tables aligned with mainProyectoDB.sql
'use strict';

const migration = {
  up: async (queryInterface, Sequelize) => {
    // Create INSIGNIAS table
    await queryInterface.createTable('INSIGNIAS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      icono_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      color_hex: {
        type: Sequelize.STRING(7),
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i
        }
      },
      tipo: {
        type: Sequelize.ENUM('productos', 'valoraciones', 'ventas'),
        allowNull: false
      },
      umbral_requerido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
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
      }
    });

    // Create USUARIO_INSIGNIAS table
    await queryInterface.createTable('USUARIO_INSIGNIAS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      insignia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'INSIGNIAS',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      otorgada_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      razon_otorgamiento: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('INSIGNIAS', ['activa'], { 
      name: 'idx_insignias_activa' 
    });
    await queryInterface.addIndex('INSIGNIAS', ['tipo'], { 
      name: 'idx_insignias_tipo' 
    });
    
    // Add unique constraint for user-badge combination
    await queryInterface.addConstraint('USUARIO_INSIGNIAS', {
      fields: ['usuario_id', 'insignia_id'],
      type: 'unique',
      name: 'ux_usuario_insignia'
    });
    
    await queryInterface.addIndex('USUARIO_INSIGNIAS', ['usuario_id'], { 
      name: 'idx_usuario_insignias_usuario' 
    });
    await queryInterface.addIndex('USUARIO_INSIGNIAS', ['insignia_id'], { 
      name: 'idx_usuario_insignias_insignia' 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('USUARIO_INSIGNIAS');
    await queryInterface.dropTable('INSIGNIAS');
  }
};

export default migration;
