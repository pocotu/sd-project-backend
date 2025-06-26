import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  perfil_productor_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'perfil_productor_id',
    references: {
      model: 'PERFIL_PRODUCTOR',
      key: 'id'
    }
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'categoria_id'
  },
  tipo: {
    type: DataTypes.ENUM('producto', 'servicio'),
    allowNull: false,
    field: 'tipo'
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'nombre'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'descripcion'
  },
  precio: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    field: 'precio'
  },
  unidad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'unidad'
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'slug'
  },
  meta_title: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'meta_title'
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  meta_keywords: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_keywords'
  },
  activo: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    field: 'activo'
  },
  destacado: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'destacado'
  },
  vistas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'vistas'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'PRODUCTOS',
  timestamps: false
});

export default Product;