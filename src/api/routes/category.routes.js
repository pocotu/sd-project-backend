import express from 'express';
import { CategoryValidator } from '../middlewares/validation.middleware.js';
import { CategoryController } from '../controllers/category.controller.js';

const router = express.Router();
const categoryController = new CategoryController();

// Rutas de categorías
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', CategoryValidator.validateCreate(), categoryController.create);
router.put('/:id', CategoryValidator.validateUpdate(), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router; 