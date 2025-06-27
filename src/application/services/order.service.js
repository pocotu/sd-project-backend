import { OrderRepository } from '../../infrastructure/repositories/order.repository.js';
import { OrderItemRepository } from '../../infrastructure/repositories/orderItem.repository.js';
import { CartRepository } from '../../infrastructure/repositories/cart.repository.js';
import { CartItemRepository } from '../../infrastructure/repositories/cartItem.repository.js';
import { ProductRepository } from '../../infrastructure/repositories/product.repository.js';

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.cartRepository = new CartRepository();
    this.cartItemRepository = new CartItemRepository();
    this.productRepository = new ProductRepository();
  }

  async createOrderFromCart(userId, orderData = {}) {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    // Get user's active cart
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('No hay productos en el carrito');
    }

    // Validate all products are still active and available
    for (const item of cart.items) {
      if (!item.producto.activo) {
        throw new Error(`El producto ${item.producto.nombre} ya no está disponible`);
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.cantidad * item.precio_unitario);
    }, 0);

    // Prepare order data
    const newOrderData = {
      userId: userId,  // Changed from usuario_id to userId to match model property
      subtotal: subtotal,
      total: subtotal, // For now, total = subtotal (no taxes/shipping)
      estado: 'pendiente',
      direccionEntrega: orderData.direccionEntrega || null,
      telefonoContacto: orderData.telefonoContacto || null,
      notasEspeciales: orderData.notasEspeciales || null,
      fechaEstimadaEntrega: orderData.fechaEstimadaEntrega || null
    };

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.producto_id,  // Using the actual field name from CartItem
      cantidad: item.cantidad,
      precioUnitario: item.precio_unitario  // Using the actual field name from CartItem
    }));

    // Create order with items
    const order = await this.orderRepository.createOrderWithItems(newOrderData, orderItems);

    // Clear the cart after successful order creation
    await this.cartItemRepository.clearCart(cart.id);

    return order;
  }

  async getUserOrders(userId, options = {}) {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    return await this.orderRepository.findOrdersByUserId(userId, options);
  }

  async getOrderById(orderId, userId = null) {
    if (!orderId) {
      throw new Error('ID de pedido requerido');
    }

    const order = await this.orderRepository.findOrderWithItems(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // If userId is provided, ensure the order belongs to the user
    if (userId && order.userId !== userId) {
      throw new Error('No tienes permisos para ver este pedido');
    }

    return order;
  }

  async updateOrderStatus(orderId, newStatus, userId = null) {
    const validStatuses = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado de pedido inválido');
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // If userId is provided, ensure the order belongs to the user (for user cancellations)
    if (userId && order.userId !== userId) {
      throw new Error('No tienes permisos para modificar este pedido');
    }

    // Business rules for status transitions
    if (userId && newStatus !== 'cancelado') {
      throw new Error('Los usuarios solo pueden cancelar pedidos');
    }

    if (newStatus === 'cancelado' && ['entregado'].includes(order.estado)) {
      throw new Error('No se puede cancelar un pedido ya entregado');
    }

    await this.orderRepository.updateOrderStatus(orderId, newStatus);
    return await this.orderRepository.findOrderWithItems(orderId);
  }

  async getOrdersByStatus(estado, options = {}) {
    const validStatuses = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(estado)) {
      throw new Error('Estado de pedido inválido');
    }

    return await this.orderRepository.findOrdersByStatus(estado, options);
  }

  async cancelOrder(orderId, userId) {
    return await this.updateOrderStatus(orderId, 'cancelado', userId);
  }

  // Admin methods (no userId restriction)
  async getAllOrders(options = {}) {
    return await this.orderRepository.findAll({
      include: [
        {
          model: this.orderItemRepository.model,
          as: 'items',
          include: [
            {
              model: this.productRepository.model,
              as: 'producto',
              attributes: ['id', 'nombre', 'precio', 'unidad']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async adminUpdateOrderStatus(orderId, newStatus) {
    return await this.updateOrderStatus(orderId, newStatus);
  }
}
