import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo para gestión de insignias de gamificación
 * Siguiendo principios SOLID: SRP (Single Responsibility)
 */
const Insignia = sequelize.define('Insignia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'nombre'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'descripcion'
  },
  icono_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'icono_url'
  },
  color_hex: {
    type: DataTypes.STRING(7),
    allowNull: true,
    field: 'color_hex',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  tipo: {
    type: DataTypes.ENUM('productos', 'valoraciones', 'ventas'),
    allowNull: false,
    field: 'tipo'
  },
  umbral_requerido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'umbral_requerido',
    validate: {
      min: 1
    }
  },
  activa: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    field: 'activa'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'INSIGNIAS',
  timestamps: false,
  indexes: [
    {
      fields: ['activa']
    },
    {
      fields: ['tipo']
    }
  ]
});

export default Insignia;
