import { DataTypes } from 'sequelize';

// Modelo alineado con la tabla real 'users' del SQL
export default (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
      field: 'id'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'firstName'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'lastName'
    },
    roleId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'roleId'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'isActive'
    },
    forcePasswordChange: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'forcePasswordChange'
    },
    lastPasswordChange: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastPasswordChange'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastLogin'
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'failedLoginAttempts'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'createdAt',
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updatedAt',
      defaultValue: DataTypes.NOW
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deletedAt'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true
  });
};