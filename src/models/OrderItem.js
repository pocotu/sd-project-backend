import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'pedido_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'producto_id'
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'precio_unitario'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'PEDIDO_ITEMS',
  timestamps: true,
  paranoid: true,
  underscored: false,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  indexes: [
    {
      fields: ['pedido_id']
    },
    {
      fields: ['producto_id']
    }
  ],
  hooks: {
    beforeSave: (orderItem) => {
      // Calculate subtotal before saving
      orderItem.subtotal = orderItem.cantidad * orderItem.precioUnitario;
    }
  }
});

export default OrderItem;
