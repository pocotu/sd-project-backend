import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RolPermisos = sequelize.define('RolPermisos', {
  rol_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'roles',
      key: 'id'
    },
    field: 'rol_id'
  },
  permiso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'PERMISOS',
      key: 'id'
    },
    field: 'permiso_id'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'ROL_PERMISOS',
  timestamps: false
});

export default RolPermisos;
