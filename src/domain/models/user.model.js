import { DataTypes } from 'sequelize';
import { sequelize } from '../../infrastructure/database/sequelize.js';
import { v4 as uuidv4 } from 'uuid';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false
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
    defaultValue: DataTypes.NOW
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
  tableName: 'users',
  timestamps: true,
  paranoid: true
}); 