import express from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { CartValidator } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
router.use(authMiddleware);

// GET /api/cart - Obtener contenido del carrito
router.get('/', cartController.getCart.bind(cartController));

// POST /api/cart/items - Agregar producto al carrito
router.post('/items', 
  CartValidator.validateAddProduct(),
  cartController.addProduct.bind(cartController)
);

// PUT /api/cart/items/:productId - Actualizar cantidad de producto
router.put('/items/:productId', 
  CartValidator.validateUpdateQuantity(),
  cartController.updateQuantity.bind(cartController)
);

// DELETE /api/cart/items/:productId - Remover producto del carrito
router.delete('/items/:productId', cartController.removeProduct.bind(cartController));

// DELETE /api/cart - Vaciar carrito
router.delete('/', cartController.clearCart.bind(cartController));

export default router;
