import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Permiso = sequelize.define('Permiso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'accion'
  },
  recurso: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'recurso'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'descripcion'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'PERMISOS',
  timestamps: false
});

export default Permiso;
