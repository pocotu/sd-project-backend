import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo para gestión de reportes de exportación
 * Siguiendo principios SOLID: SRP (Single Responsibility)
 */
const ExportReport = sequelize.define('ExportReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  usuario_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'usuario_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tipo_reporte: {
    type: DataTypes.ENUM('productos', 'metricas', 'valoraciones', 'contactos'),
    allowNull: false,
    field: 'tipo_reporte'
  },
  formato: {
    type: DataTypes.ENUM('csv', 'pdf', 'excel'),
    allowNull: false,
    field: 'formato'
  },
  parametros_filtro: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'parametros_filtro'
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'nombre_archivo'
  },
  url_descarga: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'url_descarga'
  },
  estado: {
    type: DataTypes.ENUM('generando', 'completado', 'error'),
    allowNull: false,
    defaultValue: 'generando',
    field: 'estado'
  },
  solicitado_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'solicitado_at'
  },
  completado_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completado_at'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  }
}, {
  tableName: 'EXPORT_REPORTS',
  timestamps: false,
  indexes: [
    {
      fields: ['usuario_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['expires_at']
    }
  ]
});

export default ExportReport;
