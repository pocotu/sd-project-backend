import { DataTypes } from 'sequelize';
import { BaseModel } from './BaseModel.js';
import sequelize from '../config/database.js';

class Category extends BaseModel {
  static associate(models) {
    // Define associations here
    this.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });
  }
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
  }
);

export default Category; 