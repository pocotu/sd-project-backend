import express from 'express';
import RoleController from '../controllers/role.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import RBACMiddleware from '../middlewares/rbac.middleware.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Validaciones para roles
const validateRole = [
  ValidationMiddleware.body('nombre')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  ValidationMiddleware.body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  ValidationMiddleware.body('permisos')
    .optional()
    .isArray()
    .withMessage('Los permisos deben ser un array'),
  ValidationMiddleware.body('permisos.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cada permiso debe ser un ID válido'),
  ValidationMiddleware.handleValidationErrors
];

const validateRoleUpdate = [
  ValidationMiddleware.body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  ValidationMiddleware.body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  ValidationMiddleware.body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser booleano'),
  ValidationMiddleware.body('permisos')
    .optional()
    .isArray()
    .withMessage('Los permisos deben ser un array'),
  ValidationMiddleware.body('permisos.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cada permiso debe ser un ID válido'),
  ValidationMiddleware.handleValidationErrors
];

const validateRoleAssignment = [
  ValidationMiddleware.body('userId')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido'),
  ValidationMiddleware.body('roleId')
    .isUUID()
    .withMessage('El ID del rol debe ser un UUID válido'),
  ValidationMiddleware.body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('La fecha de expiración debe ser válida'),
  ValidationMiddleware.handleValidationErrors
];

// Rutas CRUD para roles
router.get(
  '/',
  RBACMiddleware.requirePermission('leer', 'roles'),
  RoleController.getAllRoles
);

router.get(
  '/:id',
  RBACMiddleware.requirePermission('leer', 'roles'),
  RoleController.getRoleById
);

router.post(
  '/',
  RBACMiddleware.requirePermission('crear', 'roles'),
  validateRole,
  RoleController.createRole
);

router.put(
  '/:id',
  RBACMiddleware.requirePermission('actualizar', 'roles'),
  validateRoleUpdate,
  RoleController.updateRole
);

router.delete(
  '/:id',
  RBACMiddleware.requirePermission('eliminar', 'roles'),
  RoleController.deleteRole
);

// Rutas para asignación de roles
router.post(
  '/assign',
  RBACMiddleware.requirePermission('asignar', 'roles'),
  validateRoleAssignment,
  RoleController.assignRoleToUser
);

router.delete(
  '/remove/:userId/:roleId',
  RBACMiddleware.requirePermission('asignar', 'roles'),
  RoleController.removeRoleFromUser
);

// Ruta para obtener usuarios con sus roles
router.get(
  '/users/with-roles',
  RBACMiddleware.requirePermission('leer', 'usuarios'),
  RoleController.getUsersWithRoles
);

export default router;
