import express from 'express';
import PermissionController from '../controllers/permission.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import RBACMiddleware from '../middlewares/rbac.middleware.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Validaciones para permisos
const validatePermission = [
  ValidationMiddleware.body('accion')
    .isLength({ min: 2, max: 100 })
    .withMessage('La acción debe tener entre 2 y 100 caracteres'),
  ValidationMiddleware.body('recurso')
    .isLength({ min: 2, max: 100 })
    .withMessage('El recurso debe tener entre 2 y 100 caracteres'),
  ValidationMiddleware.body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  ValidationMiddleware.handleValidationErrors
];

const validatePermissionUpdate = [
  ValidationMiddleware.body('accion')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La acción debe tener entre 2 y 100 caracteres'),
  ValidationMiddleware.body('recurso')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El recurso debe tener entre 2 y 100 caracteres'),
  ValidationMiddleware.body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  ValidationMiddleware.handleValidationErrors
];

// Rutas CRUD para permisos
router.get(
  '/',
  RBACMiddleware.requirePermission('leer', 'roles'),
  PermissionController.getAllPermissions
);

router.get(
  '/by-resource',
  RBACMiddleware.requirePermission('leer', 'roles'),
  PermissionController.getPermissionsByResource
);

router.get(
  '/:id',
  RBACMiddleware.requirePermission('leer', 'roles'),
  PermissionController.getPermissionById
);

router.post(
  '/',
  RBACMiddleware.requirePermission('crear', 'roles'),
  validatePermission,
  PermissionController.createPermission
);

router.put(
  '/:id',
  RBACMiddleware.requirePermission('actualizar', 'roles'),
  validatePermissionUpdate,
  PermissionController.updatePermission
);

router.delete(
  '/:id',
  RBACMiddleware.requirePermission('eliminar', 'roles'),
  PermissionController.deletePermission
);

// Ruta especial para inicializar permisos del sistema
router.post(
  '/initialize',
  RBACMiddleware.requireAdmin(),
  PermissionController.initializeDefaultPermissions
);

export default router;
