import express from 'express';
const router = express.Router();

// Importar rutas
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running'
  });
});

export default router; 