import CartItem from '../../models/CartItem.js';
import Product from '../../models/Product.js';
import { BaseRepository } from './base.repository.js';

export class CartItemRepository extends BaseRepository {
  constructor() {
    super(CartItem);
  }

  async findByCartAndProduct(cartId, productId) {
    return await this.model.findOne({
      where: { 
        carrito_id: cartId, 
        producto_id: productId 
      },
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
        }
      ]
    });
  }

  async findByCartId(cartId) {
    return await this.model.findAll({
      where: { carrito_id: cartId },
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
        }
      ]
    });
  }

  async createOrUpdate(cartId, productId, cantidad, precioUnitario) {
    const existingItem = await this.findByCartAndProduct(cartId, productId);
    
    if (existingItem) {
      // Update existing item
      await existingItem.update({ cantidad });
      return existingItem;
    } else {
      // Create new item
      return await this.model.create({
        carrito_id: cartId,
        producto_id: productId,
        cantidad,
        precio_unitario: precioUnitario
      });
    }
  }

  async removeByCartAndProduct(cartId, productId) {
    const item = await this.findByCartAndProduct(cartId, productId);
    if (!item) return false;
    await item.destroy();
    return true;
  }

  async clearCart(cartId) {
    return await this.model.destroy({
      where: { carrito_id: cartId }
    });
  }
}
