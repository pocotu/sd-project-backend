import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('ESTADISTICAS_EMPRENDEDOR', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      perfil_productor_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
          model: 'PERFIL_PRODUCTOR',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      total_productos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_servicios: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_vistas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_contactos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating_promedio_productos: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
          max: 5
        }
      },
      rating_promedio_vendedor: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
          max: 5
        }
      },
      total_valoraciones_productos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_valoraciones_vendedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      insignias_obtenidas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ESTADISTICAS_EMPRENDEDOR');
  }
};
