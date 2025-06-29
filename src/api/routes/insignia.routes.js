import express from 'express';
import InsigniaController from '../controllers/insignia.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import RBACMiddleware from '../middlewares/rbac.middleware.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = express.Router();
const insigniaController = new InsigniaController();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Validaciones para crear insignia
const validateInsigniaCreate = [
  ValidationMiddleware.body('nombre')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  ValidationMiddleware.body('descripcion')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  ValidationMiddleware.body('tipo')
    .isIn(['productos', 'valoraciones', 'ventas'])
    .withMessage('Tipo de insignia inválido'),
  ValidationMiddleware.body('umbral_requerido')
    .isInt({ min: 1 })
    .withMessage('El umbral requerido debe ser mayor a 0'),
  ValidationMiddleware.body('icono_url')
    .optional()
    .isURL()
    .withMessage('URL de icono inválida'),
  ValidationMiddleware.body('color_hex')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color hexadecimal inválido'),
  ValidationMiddleware.handleValidationErrors
];

// Validaciones para actualizar insignia
const validateInsigniaUpdate = [
  ValidationMiddleware.param('id')
    .isInt({ min: 1 })
    .withMessage('ID de insignia inválido'),
  ValidationMiddleware.body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  ValidationMiddleware.body('descripcion')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  ValidationMiddleware.body('tipo')
    .optional()
    .isIn(['productos', 'valoraciones', 'ventas'])
    .withMessage('Tipo de insignia inválido'),
  ValidationMiddleware.body('umbral_requerido')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El umbral requerido debe ser mayor a 0'),
  ValidationMiddleware.body('icono_url')
    .optional()
    .isURL()
    .withMessage('URL de icono inválida'),
  ValidationMiddleware.body('color_hex')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color hexadecimal inválido'),
  ValidationMiddleware.handleValidationErrors
];

// Validaciones para otorgar/revocar insignia
const validateGrantRevoke = [
  ValidationMiddleware.body('usuario_id')
    .isUUID()
    .withMessage('ID de usuario inválido'),
  ValidationMiddleware.body('insignia_id')
    .isInt({ min: 1 })
    .withMessage('ID de insignia inválido'),
  ValidationMiddleware.body('razon')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('La razón debe tener entre 1 y 255 caracteres'),
  ValidationMiddleware.handleValidationErrors
];

// RUTAS PÚBLICAS (para usuarios autenticados)

/**
 * @route GET /api/insignias/types
 * @desc Obtener tipos de insignias disponibles
 * @access Private
 */
router.get('/types', insigniaController.getInsigniaTypes.bind(insigniaController));

/**
 * @route GET /api/insignias
 * @desc Obtener todas las insignias
 * @access Private
 */
router.get('/', insigniaController.getAllInsignias.bind(insigniaController));

/**
 * @route GET /api/insignias/my
 * @desc Obtener mis insignias (usuario autenticado)
 * @access Private
 */
router.get('/my', insigniaController.getMyInsignias.bind(insigniaController));

/**
 * @route POST /api/insignias/check-my-auto
 * @desc Verificar mis insignias automáticas
 * @access Private
 */
router.post('/check-my-auto', insigniaController.checkMyAutoInsignias.bind(insigniaController));

/**
 * @route GET /api/insignias/users/:userId
 * @desc Obtener insignias de un usuario específico
 * @access Private
 */
router.get(
  '/users/:userId',
  ValidationMiddleware.param('userId').isUUID().withMessage('ID de usuario inválido'),
  ValidationMiddleware.handleValidationErrors,
  insigniaController.getUserInsignias.bind(insigniaController)
);

/**
 * @route GET /api/insignias/:id
 * @desc Obtener insignia específica
 * @access Private
 */
router.get(
  '/:id',
  ValidationMiddleware.param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  ValidationMiddleware.handleValidationErrors,
  insigniaController.getInsignia.bind(insigniaController)
);

// RUTAS ADMINISTRATIVAS

/**
 * @route GET /api/insignias/stats
 * @desc Obtener estadísticas de insignias
 * @access Admin
 */
router.get(
  '/stats',
  RBACMiddleware.requirePermission('leer', 'insignias'),
  insigniaController.getInsigniaStats.bind(insigniaController)
);

/**
 * @route POST /api/insignias
 * @desc Crear nueva insignia
 * @access Admin
 */
router.post(
  '/',
  RBACMiddleware.requirePermission('crear', 'insignias'),
  validateInsigniaCreate,
  insigniaController.createInsignia.bind(insigniaController)
);

/**
 * @route PUT /api/insignias/:id
 * @desc Actualizar insignia
 * @access Admin
 */
router.put(
  '/:id',
  RBACMiddleware.requirePermission('actualizar', 'insignias'),
  validateInsigniaUpdate,
  insigniaController.updateInsignia.bind(insigniaController)
);

/**
 * @route PATCH /api/insignias/:id/toggle
 * @desc Activar/Desactivar insignia
 * @access Admin
 */
router.patch(
  '/:id/toggle',
  RBACMiddleware.requirePermission('actualizar', 'insignias'),
  ValidationMiddleware.param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  ValidationMiddleware.body('activa').isBoolean().withMessage('Estado activo debe ser boolean'),
  ValidationMiddleware.handleValidationErrors,
  insigniaController.toggleInsignia.bind(insigniaController)
);

/**
 * @route POST /api/insignias/grant
 * @desc Otorgar insignia manualmente
 * @access Admin
 */
router.post(
  '/grant',
  RBACMiddleware.requirePermission('asignar', 'insignias'),
  validateGrantRevoke,
  insigniaController.grantInsignia.bind(insigniaController)
);

/**
 * @route DELETE /api/insignias/revoke
 * @desc Revocar insignia
 * @access Admin
 */
router.delete(
  '/revoke',
  RBACMiddleware.requirePermission('eliminar', 'insignias'),
  validateGrantRevoke,
  insigniaController.revokeInsignia.bind(insigniaController)
);

/**
 * @route POST /api/insignias/check-auto/:userId
 * @desc Verificar y otorgar insignias automáticamente para un usuario
 * @access Admin
 */
router.post(
  '/check-auto/:userId',
  RBACMiddleware.requirePermission('asignar', 'insignias'),
  ValidationMiddleware.param('userId').isUUID().withMessage('ID de usuario inválido'),
  ValidationMiddleware.handleValidationErrors,
  insigniaController.checkAutoInsignias.bind(insigniaController)
);

export default router;
