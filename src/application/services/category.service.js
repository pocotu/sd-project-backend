import { CategoryRepository } from '../../infrastructure/repositories/category.repository.js';
import slugify from 'slugify';

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async createCategory(data) {
    try {
      // Validación de unicidad a nivel de servicio para OCP
      const existing = await this.categoryRepository.model.findOne({ where: { name: data.name } });
      if (existing) {
        const error = new Error('El nombre de la categoría ya existe');
        error.name = 'SequelizeUniqueConstraintError';
        throw error;
      }
      // Generar slug automáticamente si no se envía
      const slug = data.slug || slugify(data.name, { lower: true, strict: true });
      // Asegurar que createdAt se envía siempre
      const createdAt = new Date();
      // Log para depuración
      console.log('[CategoryService][createCategory] Data enviada a create:', {
        name: data.name,
        description: data.description,
        slug,
        parentId: data.parentId || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 0
      });
      return await this.categoryRepository.create({
        name: data.name,
        description: data.description,
        slug,
        parentId: data.parentId || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 0,
        createdAt
      });
    } catch (error) {
      console.error('[CategoryService][createCategory] Error:', error);
      throw error;
    }
  }

  async getAllCategories() {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id) {
    return await this.categoryRepository.findById(id);
  }

  async updateCategory(id, data) {
    if (data.name) {
      const existing = await this.categoryRepository.model.findOne({ where: { name: data.name } });
      if (existing && existing.id !== parseInt(id)) {
        const error = new Error('El nombre de la categoría ya existe');
        error.name = 'SequelizeUniqueConstraintError';
        throw error;
      }
    }
    // Si se actualiza el nombre, actualizar el slug también
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    return await this.categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    return await this.categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();