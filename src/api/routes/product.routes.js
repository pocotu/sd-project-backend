import express from 'express';
import multer from 'multer';
import path from 'path';
import { ProductValidator } from '../middlewares/validation.middleware.js';
import { ProductController } from '../controllers/product.controller.js';

const router = express.Router();
const productController = new ProductController();

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/products'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// CRUD de productos
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post(
  '/',
  upload.single('image'),
  ProductValidator.validateCreate(),
  productController.create
);
router.put(
  '/:id',
  upload.single('image'),
  ProductValidator.validateUpdate(),
  productController.update
);
router.delete('/:id', productController.delete);

router.get('/search', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

router.get('/featured', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

export default router; 