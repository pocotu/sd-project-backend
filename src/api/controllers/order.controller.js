import { OrderService } from '../../application/services/order.service.js';

export class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  // Create order from cart
  createOrder = async (req, res) => {
    try {
      const userId = req.user.id;
      const orderData = req.body;

      const order = await this.orderService.createOrderFromCart(userId, orderData);

      res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: order
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Get user's orders
  getUserOrders = async (req, res) => {
    try {
      const userId = req.user.id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        estado: req.query.estado
      };

      const result = await this.orderService.getUserOrders(userId, options);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          total: result.count,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil(result.count / options.limit)
        }
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Get specific order
  getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID format (should be a number for order IDs)
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de pedido inválido'
        });
      }
      
      const userId = req.user.id;

      const order = await this.orderService.getOrderById(id, userId);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error getting order:', error);
      const status = error.message.includes('permisos') ? 403 : 
                   error.message.includes('encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  // Cancel order (user can only cancel their own orders)
  cancelOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await this.orderService.cancelOrder(id, userId);

      res.json({
        success: true,
        message: 'Pedido cancelado exitosamente',
        data: order
      });
    } catch (error) {
      console.error('Error canceling order:', error);
      const status = error.message.includes('permisos') ? 403 : 
                   error.message.includes('encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  // Admin methods
  getAllOrders = async (req, res) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        estado: req.query.estado
      };

      let result;
      if (options.estado) {
        result = await this.orderService.getOrdersByStatus(options.estado, options);
      } else {
        result = await this.orderService.getAllOrders({
          limit: options.limit,
          offset: (options.page - 1) * options.limit
        });
      }

      res.json({
        success: true,
        data: Array.isArray(result) ? result : result.rows || result,
        pagination: result.count ? {
          total: result.count,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil(result.count / options.limit)
        } : undefined
      });
    } catch (error) {
      console.error('Error getting all orders:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      // Validate status
      const validStatuses = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'Estado es requerido'
        });
      }
      
      if (!validStatuses.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado de pedido inválido. Estados permitidos: ' + validStatuses.join(', ')
        });
      }

      const order = await this.orderService.adminUpdateOrderStatus(id, estado);

      res.json({
        success: true,
        message: 'Estado del pedido actualizado exitosamente',
        data: order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      const status = error.message.includes('encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };
}
