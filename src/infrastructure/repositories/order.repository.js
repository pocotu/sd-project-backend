import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import { BaseRepository } from './base.repository.js';

export class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findOrdersByUserId(userId, options = {}) {
    const { page = 1, limit = 10, estado } = options;
    const offset = (page - 1) * limit;
    
    const where = { userId: userId }; // Changed from usuario_id to userId to match model property
    if (estado) {
      where.estado = estado;
    }

    return await this.model.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  async findOrderWithItems(orderId) {
    return await this.model.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'precio', 'unidad', 'activo']
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
  }

  async findOrdersByStatus(estado, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    return await this.model.findAndCountAll({
      where: { estado },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'precio', 'unidad']
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  async updateOrderStatus(orderId, estado) {
    return await this.model.update(
      { estado },
      { 
        where: { id: orderId },
        returning: true
      }
    );
  }

  async createOrderWithItems(orderData, items) {
    const transaction = await this.model.sequelize.transaction();
    
    try {
      // Create order
      const order = await this.model.create(orderData, { transaction });
      
      // Create order items
      const orderItems = items.map(item => ({
        ...item,
        orderId: order.id, // Changed from pedido_id to orderId to match model property
        subtotal: item.cantidad * item.precioUnitario // Changed from precio_unitario to precioUnitario to match service input
      }));
      
      await OrderItem.bulkCreate(orderItems, { transaction });
      
      await transaction.commit();
      
      // Return order with items
      return await this.findOrderWithItems(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
