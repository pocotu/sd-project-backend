import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'usuario_id'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  fechaEstimadaEntrega: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_estimada_entrega'
  },
  direccionEntrega: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'direccion_entrega'
  },
  notasEspeciales: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notas_especiales'
  },
  telefonoContacto: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telefono_contacto'
  }
}, {
  tableName: 'PEDIDOS',
  timestamps: true,
  paranoid: true,
  underscored: false,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  indexes: [
    {
      fields: ['usuario_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['createdAt']
    }
  ]
});

export default Order;
