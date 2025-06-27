import { CartService } from '../../application/services/cart.service.js';

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await this.cartService.getCartContents(userId);
      
      res.status(200).json({
        status: 'success',
        data: cart
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  async addProduct(req, res) {
    try {
      const userId = req.user.id;
      const { productId, cantidad = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          status: 'error',
          message: 'ID del producto es requerido'
        });
      }

      const cart = await this.cartService.addProductToCart(userId, productId, cantidad);
      
      res.status(200).json({
        status: 'success',
        message: 'Producto agregado al carrito',
        data: cart
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  async updateQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const { cantidad } = req.body;

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad debe ser mayor a 0'
        });
      }

      const cart = await this.cartService.updateProductQuantity(userId, parseInt(productId), cantidad);
      
      res.status(200).json({
        status: 'success',
        message: 'Cantidad actualizada',
        data: cart
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  async removeProduct(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const cart = await this.cartService.removeProductFromCart(userId, parseInt(productId));
      
      res.status(200).json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        data: cart
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await this.cartService.clearCart(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Carrito vaciado',
        data: cart
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }
}

// Create a singleton instance
export const cartController = new CartController();
