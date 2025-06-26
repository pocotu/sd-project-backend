import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/sequelize.js';

class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'nombre'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: false
});

export { Role };