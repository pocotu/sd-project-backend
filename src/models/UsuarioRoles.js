import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UsuarioRoles = sequelize.define('UsuarioRoles', {
  usuario_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'usuario_id'
  },
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
  asignado_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'asignado_at'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  }
}, {
  tableName: 'USUARIO_ROLES',
  timestamps: false
});

export default UsuarioRoles;
