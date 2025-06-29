import express from 'express';
import ExportReportController from '../controllers/exportReport.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import RBACMiddleware from '../middlewares/rbac.middleware.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = express.Router();
const exportReportController = new ExportReportController();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Validaciones para solicitud de reporte
const validateReportRequest = [
  ValidationMiddleware.body('tipo_reporte')
    .isIn(['productos', 'metricas', 'valoraciones', 'contactos'])
    .withMessage('Tipo de reporte inválido'),
  ValidationMiddleware.body('formato')
    .isIn(['csv', 'pdf', 'excel'])
    .withMessage('Formato inválido'),
  ValidationMiddleware.body('filtros')
    .optional()
    .isObject()
    .withMessage('Los filtros deben ser un objeto'),
  ValidationMiddleware.handleValidationErrors
];

// Validaciones para cancelación
const validateCancelReport = [
  ValidationMiddleware.param('id')
    .isInt({ min: 1 })
    .withMessage('ID de reporte inválido'),
  ValidationMiddleware.handleValidationErrors
];

// RUTAS PÚBLICAS (para usuarios autenticados)

/**
 * @route GET /api/reports/types
 * @desc Obtener tipos de reportes disponibles
 * @access Private
 */
router.get('/types', exportReportController.getReportTypes.bind(exportReportController));

/**
 * @route POST /api/reports/request
 * @desc Solicitar generación de reporte
 * @access Private
 */
router.post(
  '/request',
  validateReportRequest,
  exportReportController.requestReport.bind(exportReportController)
);

/**
 * @route GET /api/reports
 * @desc Obtener reportes del usuario autenticado
 * @access Private
 */
router.get('/', exportReportController.getUserReports.bind(exportReportController));

/**
 * @route GET /api/reports/:id
 * @desc Obtener reporte específico
 * @access Private
 */
router.get(
  '/:id',
  ValidationMiddleware.param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  ValidationMiddleware.handleValidationErrors,
  exportReportController.getReport.bind(exportReportController)
);

/**
 * @route PATCH /api/reports/:id/cancel
 * @desc Cancelar reporte pendiente
 * @access Private
 */
router.patch(
  '/:id/cancel',
  validateCancelReport,
  exportReportController.cancelReport.bind(exportReportController)
);

/**
 * @route GET /api/reports/download/:filename
 * @desc Descargar archivo de reporte
 * @access Private
 */
router.get(
  '/download/:filename',
  ValidationMiddleware.param('filename')
    .isLength({ min: 1 })
    .withMessage('Nombre de archivo inválido'),
  ValidationMiddleware.handleValidationErrors,
  exportReportController.downloadReport.bind(exportReportController)
);

/**
 * @route GET /api/export-reports/download/:filename
 * @desc Descargar archivo de reporte generado
 * @access Private
 */
router.get('/download/:filename', exportReportController.downloadReport.bind(exportReportController));

// RUTAS ADMINISTRATIVAS

/**
 * @route DELETE /api/reports/cleanup
 * @desc Limpiar reportes expirados (solo administradores)
 * @access Admin
 */
router.delete(
  '/cleanup',
  RBACMiddleware.requirePermission('eliminar', 'reportes'),
  exportReportController.cleanupExpiredReports.bind(exportReportController)
);

export default router;
