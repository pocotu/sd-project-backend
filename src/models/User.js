import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    field: 'id',
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'email',
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password',
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'firstName',
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'lastName',
  },
  roleId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'roleId',
  },
  isActive: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
    allowNull: false,
    field: 'isActive',
  },
  forcePasswordChange: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
    allowNull: false,
    field: 'forcePasswordChange',
  },
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'lastPasswordChange',
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'lastLogin',
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'failedLoginAttempts',
  },
},
{
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paranoid: true,
  deletedAt: 'deletedAt',
});

export default User;