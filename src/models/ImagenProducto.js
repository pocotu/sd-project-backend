import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ImagenProducto = sequelize.define('ImagenProducto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'producto_id',
    references: {
      model: 'PRODUCTOS',
      key: 'id'
    }
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'nombre_archivo'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'url'
  },
  texto_alternativo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'texto_alternativo'
  },
  es_principal: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    field: 'es_principal'
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'orden'
  },
  tamano_bytes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tamano_bytes'
  },
  tipo_mime: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tipo_mime'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'IMAGENES_PRODUCTO',
  timestamps: false
});

export default ImagenProducto;
