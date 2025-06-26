import { CategoryRepository } from '../../infrastructure/repositories/category.repository.js';
import slugify from 'slugify';

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async createCategory(data) {
    try {
      // Validación de unicidad a nivel de servicio para OCP
      const existing = await this.categoryRepository.model.findOne({ where: { nombre: data.nombre } });
      if (existing) {
        const error = new Error('El nombre de la categoría ya existe');
        error.name = 'SequelizeUniqueConstraintError';
        throw error;
      }
      // Generar slug automáticamente si no se envía
      const slug = data.slug || slugify(data.nombre, { lower: true, strict: true });
      const createdAt = new Date();
      // Log para depuración
      console.log('[CategoryService][createCategory] Data enviada a create:', {
        nombre: data.nombre,
        descripcion: data.descripcion,
        slug,
        parent_id: data.parent_id || null,
        imagen_url: data.imagen_url || null,
        activo: data.activo !== undefined ? data.activo : 1,
        orden: data.orden || 0
      });
      return await this.categoryRepository.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        slug,
        parent_id: data.parent_id || null,
        imagen_url: data.imagen_url || null,
        activo: data.activo !== undefined ? data.activo : 1,
        orden: data.orden || 0,
        created_at: createdAt
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
    if (data.nombre) {
      const existing = await this.categoryRepository.model.findOne({ where: { nombre: data.nombre } });
      if (existing && existing.id !== parseInt(id)) {
        const error = new Error('El nombre de la categoría ya existe');
        error.name = 'SequelizeUniqueConstraintError';
        throw error;
      }
    }
    // Si se actualiza el nombre, actualizar el slug también
    if (data.nombre && !data.slug) {
      data.slug = slugify(data.nombre, { lower: true, strict: true });
    }
    return await this.categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    return await this.categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();