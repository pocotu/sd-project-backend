import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  emprendedor_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'emprendedor_id',
    references: {
      model: 'PERFIL_PRODUCTOR',
      key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'usuario_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  nombre_contacto: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'nombre_contacto'
  },
  email_contacto: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'email_contacto'
  },
  telefono_contacto: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telefono_contacto'
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'producto_id',
    references: {
      model: 'PRODUCTOS',
      key: 'id'
    }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'mensaje'
  },
  estado: {
    type: DataTypes.ENUM('nuevo', 'leido', 'respondido', 'cerrado'),
    allowNull: false,
    defaultValue: 'nuevo',
    field: 'estado'
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
  tableName: 'CONTACTOS',
  timestamps: false
});

export default Contact;
