import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  carrito_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'carrito_id',
    references: {
      model: 'CARRITOS',
      key: 'id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'producto_id',
    references: {
      model: 'PRODUCTOS',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cantidad',
    validate: {
      min: 1
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'precio_unitario'
  },
  agregado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'agregado_en'
  }
}, {
  tableName: 'CARRITO_ITEMS',
  timestamps: false,
  indexes: [
    {
      fields: ['carrito_id']
    },
    {
      fields: ['producto_id']
    },
    {
      unique: true,
      fields: ['carrito_id', 'producto_id']
    }
  ]
});

export default CartItem;
