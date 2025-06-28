import express from 'express';
import MetricsController from '../controllers/metrics.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import RBACMiddleware from '../middlewares/rbac.middleware.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Validaciones para filtros de métricas
const validateMetricsFilters = [
  ValidationMiddleware.query('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),
  ValidationMiddleware.query('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida'),
  ValidationMiddleware.query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('El período debe ser: daily, weekly, monthly o yearly'),
  ValidationMiddleware.query('productId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número válido'),
  ValidationMiddleware.query('sellerId')
    .optional()
    .isUUID()
    .withMessage('El ID del vendedor debe ser un UUID válido'),
  ValidationMiddleware.handleValidationErrors
];

const validateConsolidatedFilters = [
  ValidationMiddleware.query('period')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('El período debe ser entre 1 y 365 días'),
  ValidationMiddleware.handleValidationErrors
];

// Rutas para métricas de productos
router.get(
  '/products',
  RBACMiddleware.requirePermission('leer', 'metricas'),
  validateMetricsFilters,
  MetricsController.getProductMetrics
);

// Rutas para métricas de vendedores
router.get(
  '/sellers',
  RBACMiddleware.requirePermission('leer', 'metricas'),
  validateMetricsFilters,
  MetricsController.getSellerMetrics
);

// Rutas para estadísticas consolidadas
router.get(
  '/consolidated',
  RBACMiddleware.requirePermission('leer', 'metricas'),
  validateConsolidatedFilters,
  MetricsController.getConsolidatedStats
);

// Dashboard de administrador (métricas clave)
router.get(
  '/admin/dashboard',
  RBACMiddleware.requireAdmin(),
  MetricsController.getAdminDashboard
);

export default router;
