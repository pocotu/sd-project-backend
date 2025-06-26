import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProducerProfile = sequelize.define('ProducerProfile', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    field: 'id'
  },
  usuario_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    field: 'usuario_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  nombre_negocio: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nombre_negocio'
  },
  ubicacion: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'ubicacion'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'bio'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telefono'
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'whatsapp'
  },
  facebook_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'facebook_url'
  },
  instagram_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'instagram_url'
  },
  tiktok_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'tiktok_url'
  },
  sitio_web: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'sitio_web'
  },
  logo_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'logo_url'
  },
  verificado: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    field: 'verificado'
  },
  activo: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    field: 'activo'
  }
}, {
  tableName: 'PERFIL_PRODUCTOR',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ProducerProfile;
