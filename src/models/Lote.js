import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Lote = sequelize.define('Lote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  numero_lote: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'numero_lote'
  },
  fecha_produccion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_produccion'
  },
  fecha_caducidad: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_caducidad'
  },
  notas_produccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notas_produccion'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'agotado', 'vencido'),
    allowNull: false,
    defaultValue: 'activo',
    field: 'estado'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'LOTES',
  timestamps: false
});

export default Lote;