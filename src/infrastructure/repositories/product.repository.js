import Product from '../../models/Product.js';
import { BaseRepository } from './base.repository.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }
  // Métodos adicionales específicos de productos pueden agregarse aquí
} 