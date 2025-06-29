import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo para la relación entre usuarios e insignias
 * Siguiendo principios SOLID: SRP (Single Responsibility)
 */
const UsuarioInsignia = sequelize.define('UsuarioInsignia', {
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
  insignia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'insignia_id',
    references: {
      model: 'INSIGNIAS',
      key: 'id'
    }
  },
  otorgada_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'otorgada_at'
  },
  razon_otorgamiento: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'razon_otorgamiento'
  }
}, {
  tableName: 'USUARIO_INSIGNIAS',
  timestamps: false,
  indexes: [
    {
      fields: ['usuario_id']
    },
    {
      fields: ['insignia_id']
    },
    {
      unique: true,
      fields: ['usuario_id', 'insignia_id']
    }
  ]
});

export default UsuarioInsignia;
