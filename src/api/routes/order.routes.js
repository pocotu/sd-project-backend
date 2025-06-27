import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { OrderValidator } from '../middlewares/validation.middleware.js';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', 
  OrderValidator.validateCreate(),
  orderController.createOrder
);

router.get('/', 
  orderController.getUserOrders
);

router.get('/:id', 
  OrderValidator.validateOrderId(),
  orderController.getOrderById
);

router.patch('/:id/cancel', 
  OrderValidator.validateOrderId(),
  orderController.cancelOrder
);

// Admin routes (TODO: Add admin middleware)
router.get('/admin/all', 
  orderController.getAllOrders
);

router.patch('/admin/:id/status', 
  OrderValidator.validateOrderId(),
  OrderValidator.validateUpdateStatus(),
  orderController.updateOrderStatus
);

export default router;
