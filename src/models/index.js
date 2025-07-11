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
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';

import UsuarioRoles from './UsuarioRoles.js';
import Permiso from './Permiso.js';
import RolPermisos from './RolPermisos.js';
import ExportReport from './ExportReport.js';
import Insignia from './Insignia.js';
import UsuarioInsignia from './UsuarioInsignia.js';

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
  Cart,
  CartItem,
  Order,
  OrderItem,
  UsuarioRoles,
  Permiso,
  RolPermisos,
  ExportReport,
  Insignia,
  UsuarioInsignia
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

// Additional associations for UsuarioRoles to support direct queries
UsuarioRoles.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
UsuarioRoles.belongsTo(Role, { foreignKey: 'rol_id', as: 'role' });
User.hasMany(UsuarioRoles, { foreignKey: 'usuario_id', as: 'usuarioRoles' });
Role.hasMany(UsuarioRoles, { foreignKey: 'rol_id', as: 'usuarioRoles' });

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

// Additional associations for RolPermisos to support direct queries
RolPermisos.belongsTo(Role, { foreignKey: 'rol_id', as: 'role' });
RolPermisos.belongsTo(Permiso, { foreignKey: 'permiso_id', as: 'permiso' });
Role.hasMany(RolPermisos, { foreignKey: 'rol_id', as: 'rolPermisos' });
Permiso.hasMany(RolPermisos, { foreignKey: 'permiso_id', as: 'rolPermisos' });

// Cart associations
User.hasMany(Cart, { foreignKey: 'usuario_id', as: 'carritos' });
Cart.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Cart.hasMany(CartItem, { foreignKey: 'carrito_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'carrito_id', as: 'carrito' });

Product.hasMany(CartItem, { foreignKey: 'producto_id', as: 'carritoItems' });
CartItem.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });

// Order associations
User.hasMany(Order, { foreignKey: 'userId', as: 'pedidos' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'pedido' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'pedidoItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'producto' });

// Export Reports associations
User.hasMany(ExportReport, { foreignKey: 'usuario_id', as: 'reportes' });
ExportReport.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Insignias associations (Many-to-Many User <-> Insignia)
User.belongsToMany(Insignia, {
  through: UsuarioInsignia,
  foreignKey: 'usuario_id',
  otherKey: 'insignia_id',
  as: 'insignias'
});
Insignia.belongsToMany(User, {
  through: UsuarioInsignia,
  foreignKey: 'insignia_id',
  otherKey: 'usuario_id',
  as: 'usuarios'
});

// Additional associations for UsuarioInsignia to support direct queries
UsuarioInsignia.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
UsuarioInsignia.belongsTo(Insignia, { foreignKey: 'insignia_id', as: 'insignia' });
User.hasMany(UsuarioInsignia, { foreignKey: 'usuario_id', as: 'usuarioInsignias' });
Insignia.hasMany(UsuarioInsignia, { foreignKey: 'insignia_id', as: 'usuarioInsignias' });

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
  Cart,
  CartItem,
  Order,
  OrderItem,
  UsuarioRoles,
  Permiso,
  RolPermisos,
  ExportReport,
  Insignia,
  UsuarioInsignia
};