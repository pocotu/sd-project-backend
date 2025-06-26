export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LOTES', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_lote: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      fecha_produccion: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_caducidad: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      notas_produccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('activo', 'agotado', 'vencido'),
        allowNull: false,
        defaultValue: 'activo'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('LOTES', ['estado'], { name: 'idx_lotes_estado' });
    await queryInterface.addIndex('LOTES', ['fecha_caducidad'], { name: 'idx_lotes_fecha_caducidad' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('LOTES');
  },
};
