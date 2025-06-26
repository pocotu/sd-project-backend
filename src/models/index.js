import sequelize from '../config/database.js';
import User from './User.js';
import Role from './Role.js';
import Product from './Product.js';
import Category from './Category.js';
import ProducerProfile from './ProducerProfile.js';
import Lote from './Lote.js';
import ProductoLote from './ProductoLote.js';
import ImagenProducto from './ImagenProducto.js';
import Review from './Review.js';
import SellerRating from './SellerRating.js';
import Contact from './Contact.js';

import UsuarioRoles from './UsuarioRoles.js';
import Permiso from './Permiso.js';
import RolPermisos from './RolPermisos.js';

const models = {
  User,
  Role,
  Product,
  Category,
  ProducerProfile,
  Lote,
  ProductoLote,
  ImagenProducto,
  Review,
  SellerRating,
  Contact,
  UsuarioRoles,
  Permiso,
  RolPermisos
};

// Definir asociaciones
User.hasOne(ProducerProfile, { foreignKey: 'usuario_id', as: 'perfilProductor' });
ProducerProfile.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Category.hasMany(Product, { foreignKey: 'categoria_id', as: 'productos' });
Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'categoria' });

ProducerProfile.hasMany(Product, { foreignKey: 'perfil_productor_id', as: 'productos' });
Product.belongsTo(ProducerProfile, { foreignKey: 'perfil_productor_id', as: 'perfilProductor' });

Product.hasMany(ImagenProducto, { foreignKey: 'producto_id', as: 'imagenes' });
ImagenProducto.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });

Product.hasMany(Review, { foreignKey: 'producto_id', as: 'resenias' });
Review.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });

User.hasMany(Review, { foreignKey: 'usuario_id', as: 'resenias' });
Review.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

ProducerProfile.hasMany(SellerRating, { foreignKey: 'perfil_productor_id', as: 'calificaciones' });
SellerRating.belongsTo(ProducerProfile, { foreignKey: 'perfil_productor_id', as: 'perfilProductor' });

User.hasMany(SellerRating, { foreignKey: 'usuario_id', as: 'calificacionesOtorgadas' });
SellerRating.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

ProducerProfile.hasMany(Contact, { foreignKey: 'emprendedor_id', as: 'contactos' });
Contact.belongsTo(ProducerProfile, { foreignKey: 'emprendedor_id', as: 'perfilProductor' });

User.hasMany(Contact, { foreignKey: 'usuario_id', as: 'contactos' });
Contact.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Product.hasMany(Contact, { foreignKey: 'producto_id', as: 'contactos' });
Contact.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });

Lote.hasMany(ProductoLote, { foreignKey: 'lote_id', as: 'productoLotes' });
ProductoLote.belongsTo(Lote, { foreignKey: 'lote_id', as: 'lote' });

Product.hasMany(ProductoLote, { foreignKey: 'producto_id', as: 'lotes' });
ProductoLote.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });


// USUARIO_ROLES (Many-to-Many User <-> Role)
User.belongsToMany(Role, {
  through: UsuarioRoles,
  foreignKey: 'usuario_id',
  otherKey: 'rol_id',
  as: 'roles'
});
Role.belongsToMany(User, {
  through: UsuarioRoles,
  foreignKey: 'rol_id',
  otherKey: 'usuario_id',
  as: 'usuarios'
});

// ROL_PERMISOS (Many-to-Many Role <-> Permiso)
Role.belongsToMany(Permiso, {
  through: RolPermisos,
  foreignKey: 'rol_id',
  otherKey: 'permiso_id',
  as: 'permisos'
});
Permiso.belongsToMany(Role, {
  through: RolPermisos,
  foreignKey: 'permiso_id',
  otherKey: 'rol_id',
  as: 'roles'
});

// Initialize associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  sequelize,
  User,
  Role,
  Product,
  Category,
  ProducerProfile,
  Lote,
  ProductoLote,
  ImagenProducto,
  Review,
  SellerRating,
  Contact,
  UsuarioRoles,
  Permiso,
  RolPermisos
};