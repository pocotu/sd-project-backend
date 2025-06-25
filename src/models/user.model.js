import { DataTypes } from 'sequelize';

class UserModel {
  constructor(sequelize) {
    this.model = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      ultimoAcceso: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'users',
      timestamps: true
    });
  }

  getModel() {
    return this.model;
  }
}

export const createUserModel = (sequelize) => {
  const userModel = new UserModel(sequelize);
  return userModel.getModel();
}; 