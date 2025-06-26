import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nombre'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'descripcion'
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'slug'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id'
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'imagen_url'
  },
  activo: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
    allowNull: false,
    field: 'activo'
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'orden'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'CATEGORIAS',
  timestamps: false
});

export default Category;