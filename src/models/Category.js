import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'nombre'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'descripcion'
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'slug'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'imagen_url'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'orden'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  }
}, {
  tableName: 'CATEGORIAS',
  timestamps: false,
  paranoid: false
});

export default Category;