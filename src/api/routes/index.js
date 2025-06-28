import express from 'express';
const router = express.Router();

// Importar rutas
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import producerProfileRoutes from './producerProfile.routes.js';
import reviewRoutes from './review.routes.js';
import contactRoutes from './contact.routes.js';
import sellerRatingRoutes from './sellerRating.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import roleRoutes from './role.routes.js';
import permissionRoutes from './permission.routes.js';
import metricsRoutes from './metrics.routes.js';

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/producer-profile', producerProfileRoutes);
router.use('/reviews', reviewRoutes);
router.use('/contacts', contactRoutes);
router.use('/seller-ratings', sellerRatingRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/metrics', metricsRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running'
  });
});

export default router;