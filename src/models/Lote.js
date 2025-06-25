import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Lote = sequelize.define('Lote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroLote: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fechaProduccion: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fechaCaducidad: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notasProduccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'agotado', 'vencido'),
    defaultValue: 'activo',
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'lotes',
  timestamps: false
});

export default Lote; 