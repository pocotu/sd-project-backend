import { ProductRepository } from '../../infrastructure/repositories/product.repository.js';
import path from 'path';
import fs from 'fs';

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(data, imageFile) {
    // El campo imagen es opcional en la tabla real, pero si se requiere, descomentar la siguiente línea:
    // if (!imageFile) throw new Error('La imagen es obligatoria');
    // const imagen_url = imageFile ? `/uploads/products/${imageFile.filename}` : null;
    return await this.productRepository.create({ ...data });
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
    // Imagen opcional
    // let imagen_url = product.imagen_url;
    // if (imageFile) {
    //   if (imagen_url) {
    //     const oldPath = path.join(process.cwd(), imagen_url);
    //     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    //   }
    //   imagen_url = `/uploads/products/${imageFile.filename}`;
    // }
    return await this.productRepository.update(id, { ...data });
  }

  async deleteProduct(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    // Imagen opcional
    // if (product.imagen_url) {
    //   const imgPath = path.join(process.cwd(), product.imagen_url);
    //   if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    // }
    return await this.productRepository.delete(id);
  }
}

export const productService = new ProductService();