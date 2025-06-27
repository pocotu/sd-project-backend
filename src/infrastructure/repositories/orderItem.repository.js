import OrderItem from '../../models/OrderItem.js';
import Product from '../../models/Product.js';
import { BaseRepository } from './base.repository.js';

export class OrderItemRepository extends BaseRepository {
  constructor() {
    super(OrderItem);
  }

  async findItemsByOrderId(orderId) {
    return await this.model.findAll({
      where: { pedido_id: orderId },
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
        }
      ]
    });
  }

  async createOrderItem(orderItemData) {
    // Calculate subtotal before creating
    const subtotal = orderItemData.cantidad * orderItemData.precio_unitario;
    
    return await this.model.create({
      ...orderItemData,
      subtotal
    });
  }

  async updateItemQuantity(orderItemId, cantidad) {
    const orderItem = await this.findById(orderItemId);
    if (!orderItem) {
      throw new Error('Item del pedido no encontrado');
    }

    const subtotal = cantidad * orderItem.precio_unitario;
    
    return await this.model.update(
      { cantidad, subtotal },
      { 
        where: { id: orderItemId },
        returning: true
      }
    );
  }

  async deleteOrderItem(orderItemId) {
    return await this.model.destroy({
      where: { id: orderItemId }
    });
  }
}
