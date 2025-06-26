import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SellerRating = sequelize.define('SellerRating', {
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
  perfil_productor_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'perfil_productor_id',
    references: {
      model: 'PERFIL_PRODUCTOR',
      key: 'id'
    }
  },
  calificacion: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    field: 'calificacion'
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'comentario'
  },
  verificada: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    field: 'verificada'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'CALIFICACIONES_VENDEDOR',
  timestamps: false
});

export default SellerRating;
