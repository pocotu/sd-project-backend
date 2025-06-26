import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/sequelize.js';
import { v4 as uuidv4 } from 'uuid';

class User extends Model {}

User.init({
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: uuidv4
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  roleId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'roleId'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  forcePasswordChange: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  paranoid: true
});

export { User };