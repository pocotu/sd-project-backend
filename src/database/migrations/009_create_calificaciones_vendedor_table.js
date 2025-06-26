export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CALIFICACIONES_VENDEDOR', {
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('CALIFICACIONES_VENDEDOR', ['perfil_productor_id'], { name: 'idx_calificaciones_perfil' });
    await queryInterface.addIndex('CALIFICACIONES_VENDEDOR', ['usuario_id'], { name: 'idx_calificaciones_usuario' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('CALIFICACIONES_VENDEDOR');
  },
};
