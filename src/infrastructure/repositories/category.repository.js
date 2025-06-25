import Category from '../../models/Category.js';
import { BaseRepository } from './base.repository.js';

export class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }
  // Métodos adicionales específicos de categorías pueden agregarse aquí
} 