import { CartRepository } from '../../infrastructure/repositories/cart.repository.js';
import { CartItemRepository } from '../../infrastructure/repositories/cartItem.repository.js';
import { ProductRepository } from '../../infrastructure/repositories/product.repository.js';

export class CartService {
  constructor() {
    this.cartRepository = new CartRepository();
    this.cartItemRepository = new CartItemRepository();
    this.productRepository = new ProductRepository();
  }

  async getOrCreateCart(userId) {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }
    
    const cart = await this.cartRepository.createOrGetActiveCart(userId);
    return this._calculateCartTotals(cart);
  }

  async addProductToCart(userId, productId, cantidad = 1) {
    if (!userId || !productId) {
      throw new Error('ID de usuario y producto son requeridos');
    }

    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Verify product exists and is active
    const product = await this.productRepository.findById(productId);
    if (!product || !product.activo) {
      throw new Error('Producto no encontrado o inactivo');
    }

    // Get or create cart
    const cart = await this.cartRepository.createOrGetActiveCart(userId);

    // Add/update item in cart
    await this.cartItemRepository.createOrUpdate(
      cart.id, 
      productId, 
      cantidad, 
      product.precio
    );

    // Return updated cart
    const updatedCart = await this.cartRepository.findCartWithItems(cart.id);
    return this._calculateCartTotals(updatedCart);
  }

  async updateProductQuantity(userId, productId, cantidad) {
    if (!userId || !productId) {
      throw new Error('ID de usuario y producto son requeridos');
    }

    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const cartItem = await this.cartItemRepository.findByCartAndProduct(cart.id, productId);
    if (!cartItem) {
      throw new Error('Producto no encontrado en el carrito');
    }

    await cartItem.update({ cantidad });

    // Return updated cart
    const updatedCart = await this.cartRepository.findCartWithItems(cart.id);
    return this._calculateCartTotals(updatedCart);
  }

  async removeProductFromCart(userId, productId) {
    if (!userId || !productId) {
      throw new Error('ID de usuario y producto son requeridos');
    }

    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const removed = await this.cartItemRepository.removeByCartAndProduct(cart.id, productId);
    if (!removed) {
      throw new Error('Producto no encontrado en el carrito');
    }

    // Return updated cart
    const updatedCart = await this.cartRepository.findCartWithItems(cart.id);
    return this._calculateCartTotals(updatedCart);
  }

  async getCartContents(userId) {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      return {
        id: null,
        items: [],
        totalItems: 0,
        subtotal: 0,
        estado: 'activo'
      };
    }

    return this._calculateCartTotals(cart);
  }

  async clearCart(userId) {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    await this.cartItemRepository.clearCart(cart.id);

    return {
      id: cart.id,
      items: [],
      totalItems: 0,
      subtotal: 0,
      estado: cart.estado
    };
  }

  _calculateCartTotals(cart) {
    if (!cart || !cart.items) {
      return {
        id: cart?.id || null,
        items: [],
        totalItems: 0,
        subtotal: 0,
        estado: cart?.estado || 'activo'
      };
    }

    const items = cart.items.map(item => ({
      id: item.id,
      producto: {
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: parseFloat(item.producto.precio),
        unidad: item.producto.unidad,
        activo: item.producto.activo
      },
      cantidad: item.cantidad,
      precio_unitario: parseFloat(item.precio_unitario),
      subtotal: item.cantidad * parseFloat(item.precio_unitario),
      agregado_en: item.agregado_en
    }));

    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart.id,
      usuario_id: cart.usuario_id,
      estado: cart.estado,
      items,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      creado_en: cart.creado_en,
      actualizado_en: cart.actualizado_en
    };
  }
}
