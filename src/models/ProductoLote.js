import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductoLote = sequelize.define('ProductoLote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  loteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidadInicial: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidadActual: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidadReservada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'producto_lotes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default ProductoLote; 