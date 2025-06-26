import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  usuario_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'usuario_id',
    references: {
      model: 'users',
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
  calificacion: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    field: 'calificacion'
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'comentario'
  },
  verificada: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    field: 'verificada'
  },
  activa: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    field: 'activa'
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
  tableName: 'RESENIAS_PRODUCTO',
  timestamps: false
});

export default Review;
