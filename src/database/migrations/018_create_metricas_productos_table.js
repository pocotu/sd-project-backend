import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('METRICAS_PRODUCTOS', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'PRODUCTOS',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      vistas_diarias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      contactos_generados: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      valoraciones_recibidas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Agregar índices y constraints
    await queryInterface.addIndex('METRICAS_PRODUCTOS', ['producto_id'], {
      name: 'idx_metricas_productos_producto'
    });
    
    await queryInterface.addIndex('METRICAS_PRODUCTOS', ['fecha'], {
      name: 'idx_metricas_productos_fecha'
    });

    // Constraint único para producto-fecha
    await queryInterface.addConstraint('METRICAS_PRODUCTOS', {
      fields: ['producto_id', 'fecha'],
      type: 'unique',
      name: 'ux_metricas_producto_fecha'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('METRICAS_PRODUCTOS');
  }
};
