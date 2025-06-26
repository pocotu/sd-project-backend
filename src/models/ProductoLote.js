import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductoLote = sequelize.define('ProductoLote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
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
  lote_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'lote_id',
    references: {
      model: 'LOTES',
      key: 'id'
    }
  },
  cantidad_inicial: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    },
    field: 'cantidad_inicial'
  },
  cantidad_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    },
    field: 'cantidad_actual'
  },
  cantidad_reservada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'cantidad_reservada'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'PRODUCTO_LOTES',
  timestamps: false
});

export default ProductoLote;