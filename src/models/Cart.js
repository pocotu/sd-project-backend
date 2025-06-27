import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  usuario_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'usuario_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('activo', 'pendiente', 'completado', 'cancelado'),
    allowNull: false,
    defaultValue: 'activo',
    field: 'estado'
  },
  creado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'creado_en'
  },
  actualizado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'actualizado_en'
  }
}, {
  tableName: 'CARRITOS',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['usuario_id']
    },
    {
      fields: ['estado']
    }
  ]
});

export default Cart;
