import { ProductRepository } from '../../infrastructure/repositories/product.repository.js';
import path from 'path';
import fs from 'fs';

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(data, imageFile) {
    if (!imageFile) throw new Error('La imagen es obligatoria');
    const imageUrl = `/uploads/products/${imageFile.filename}`;
    return await this.productRepository.create({ ...data, imageUrl });
  }

  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  async getProductById(id) {
    return await this.productRepository.findById(id);
  }

  async updateProduct(id, data, imageFile) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    let imageUrl = product.imageUrl;
    if (imageFile) {
      // Eliminar imagen anterior si existe
      if (imageUrl) {
        const oldPath = path.join(process.cwd(), imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/products/${imageFile.filename}`;
    }
    return await this.productRepository.update(id, { ...data, imageUrl });
  }

  async deleteProduct(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    // Eliminar imagen asociada
    if (product.imageUrl) {
      const imgPath = path.join(process.cwd(), product.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    return await this.productRepository.delete(id);
  }
}

export const productService = new ProductService(); 