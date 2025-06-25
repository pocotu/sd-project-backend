import { categoryService } from '../../application/services/category.service.js';

export class CategoryController {
  async create(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      // Log detallado para depuración y cumplimiento de SRP
      console.error('[CategoryController][create] Error:', error);
      let message = error.message;
      if (error.name === 'SequelizeUniqueConstraintError') {
        message = 'El nombre de la categoría ya existe';
      }
      res.status(400).json({ status: 'error', message });
    }
  }

  async getAll(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ status: 'success', data: categories });
    } catch (error) {
      console.error('[CategoryController][getAll] Error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) return res.status(404).json({ status: 'error', message: 'Categoría no encontrada' });
      res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      console.error('[CategoryController][getById] Error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ status: 'error', message: 'Categoría no encontrada' });
      res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      console.error('[CategoryController][update] Error:', error);
      let message = error.message;
      if (error.name === 'SequelizeUniqueConstraintError') {
        message = 'El nombre de la categoría ya existe';
      }
      res.status(400).json({ status: 'error', message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await categoryService.deleteCategory(req.params.id);
      if (!deleted) return res.status(404).json({ status: 'error', message: 'Categoría no encontrada' });
      res.status(204).send();
    } catch (error) {
      console.error('[CategoryController][delete] Error:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}