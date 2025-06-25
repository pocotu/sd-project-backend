import { productService } from '../../application/services/product.service.js';

export class ProductController {
  async create(req, res) {
    try {
      const product = await productService.createProduct(req.body, req.file);
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getAll(req, res) {
    const products = await productService.getAllProducts();
    res.status(200).json({ status: 'success', data: products });
  }

  async getById(req, res) {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.status(200).json({ status: 'success', data: product });
  }

  async update(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.file);
      res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
} 