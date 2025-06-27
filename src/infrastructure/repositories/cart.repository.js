import Cart from '../../models/Cart.js';
import CartItem from '../../models/CartItem.js';
import Product from '../../models/Product.js';
import { BaseRepository } from './base.repository.js';

export class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findActiveCartByUserId(userId) {
    return await this.model.findOne({
      where: { 
        usuario_id: userId, 
        estado: 'activo' 
      },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
            }
          ]
        }
      ]
    });
  }

  async findCartWithItems(cartId) {
    return await this.model.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
            }
          ]
        }
      ]
    });
  }

  async createOrGetActiveCart(userId) {
    let cart = await this.findActiveCartByUserId(userId);
    
    if (!cart) {
      cart = await this.model.create({
        usuario_id: userId,
        estado: 'activo'
      });
      // Fetch the cart with items for consistency
      cart = await this.findCartWithItems(cart.id);
    }
    
    return cart;
  }

  async updateCartStatus(cartId, status) {
    return await this.update(cartId, { estado: status });
  }
}
