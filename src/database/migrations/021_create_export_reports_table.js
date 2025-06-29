// Migration to create the EXPORT_REPORTS table aligned with mainProyectoDB.sql
'use strict';

const migration = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EXPORT_REPORTS', {
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
      tipo_reporte: {
        type: Sequelize.ENUM('productos', 'metricas', 'valoraciones', 'contactos'),
        allowNull: false
      },
      formato: {
        type: Sequelize.ENUM('csv', 'pdf', 'excel'),
        allowNull: false
      },
      parametros_filtro: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      nombre_archivo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      url_descarga: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('generando', 'completado', 'error'),
        allowNull: false,
        defaultValue: 'generando'
      },
      solicitado_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      completado_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('EXPORT_REPORTS', ['usuario_id'], { 
      name: 'idx_export_reports_usuario' 
    });
    await queryInterface.addIndex('EXPORT_REPORTS', ['estado'], { 
      name: 'idx_export_reports_estado' 
    });
    await queryInterface.addIndex('EXPORT_REPORTS', ['expires_at'], { 
      name: 'idx_export_reports_expires' 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('EXPORT_REPORTS');
  }
};

export default migration;
