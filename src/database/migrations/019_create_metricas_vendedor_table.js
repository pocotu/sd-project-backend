import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('METRICAS_VENDEDOR', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      perfil_productor_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: 'PERFIL_PRODUCTOR',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      vistas_perfil: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      productos_visitados: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      contactos_recibidos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      nuevas_valoraciones: {
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
    await queryInterface.addIndex('METRICAS_VENDEDOR', ['perfil_productor_id'], {
      name: 'idx_metricas_vendedor_perfil'
    });
    
    await queryInterface.addIndex('METRICAS_VENDEDOR', ['fecha'], {
      name: 'idx_metricas_vendedor_fecha'
    });

    // Constraint único para vendedor-fecha
    await queryInterface.addConstraint('METRICAS_VENDEDOR', {
      fields: ['perfil_productor_id', 'fecha'],
      type: 'unique',
      name: 'ux_metricas_vendedor_fecha'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('METRICAS_VENDEDOR');
  }
};
