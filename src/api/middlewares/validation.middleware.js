import { validationResult, body, param } from 'express-validator';
import { AppError } from './error.middleware.js';

// Clase base para validadores (OCP: Abierto para extensión)
export class BaseValidator {
  static validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Datos de usuario inválidos',
        details: errors.array()
      });
    }
    next();
  }
}

// Validador para usuarios (SRP: Responsabilidad única para validación de usuarios)
export class UserValidator extends BaseValidator {
  static validateCreate() {
    return [
      body('email')
        .isEmail()
        .withMessage('El email debe ser válido')
        .normalizeEmail(),
      body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula'),
      body('firstName')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
      body('lastName')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ min: 2 })
        .withMessage('El apellido debe tener al menos 2 caracteres'),
      BaseValidator.validate
    ];
  }

  static validateUpdate() {
    return [
      body('email')
        .optional()
        .isEmail()
        .withMessage('El email debe ser válido')
        .normalizeEmail(),
      body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula'),
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El apellido debe tener al menos 2 caracteres'),
      BaseValidator.validate
    ];
  }
}

// Validador para productos (SRP: Responsabilidad única para validación de productos)
export class ProductValidator extends BaseValidator {
  static validateCreate() {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),
      body('description')
        .trim()
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
      body('price')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
      body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero positivo'),
      body('categoryId')
        .isInt()
        .withMessage('La categoría es obligatoria'),
      BaseValidator.validate
    ];
  }

  static validateUpdate() {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
      body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
      body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero positivo'),
      body('categoryId')
        .optional()
        .isInt()
        .withMessage('La categoría debe ser un ID válido'),
      BaseValidator.validate
    ];
  }
}

// Validador para categorías (SRP: Responsabilidad única para validación de categorías)
export class CategoryValidator extends BaseValidator {
  static validateCreate() {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre de la categoría es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
      body('slug')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('El slug debe tener al menos 3 caracteres'),
      body('parentId')
        .optional()
        .isInt()
        .withMessage('El parentId debe ser un número entero'),
      body('imageUrl')
        .optional()
        .isString(),
      body('isActive')
        .optional()
        .isBoolean(),
      body('order')
        .optional()
        .isInt(),
      BaseValidator.validate
    ];
  }

  static validateUpdate() {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
      body('slug')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('El slug debe tener al menos 3 caracteres'),
      body('parentId')
        .optional()
        .isInt(),
      body('imageUrl')
        .optional()
        .isString(),
      body('isActive')
        .optional()
        .isBoolean(),
      body('order')
        .optional()
        .isInt(),
      BaseValidator.validate
    ];
  }
}

// Validador para lotes (SRP: Responsabilidad única para validación de lotes)
export class LoteValidator extends BaseValidator {
  static validateCreate() {
    return [
      body('numeroLote')
        .notEmpty().withMessage('El número de lote es obligatorio')
        .isLength({ min: 3 }).withMessage('El número de lote debe tener al menos 3 caracteres'),
      body('fechaProduccion')
        .notEmpty().withMessage('La fecha de producción es obligatoria')
        .isISO8601().withMessage('La fecha de producción debe ser válida'),
      body('fechaCaducidad')
        .optional({ nullable: true })
        .isISO8601().withMessage('La fecha de caducidad debe ser válida'),
      body('estado')
        .optional()
        .isIn(['activo', 'agotado', 'vencido']).withMessage('Estado inválido'),
      BaseValidator.validate
    ];
  }

  static validateUpdate() {
    return [
      body('numeroLote')
        .optional()
        .isLength({ min: 3 }).withMessage('El número de lote debe tener al menos 3 caracteres'),
      body('fechaProduccion')
        .optional()
        .isISO8601().withMessage('La fecha de producción debe ser válida'),
      body('fechaCaducidad')
        .optional({ nullable: true })
        .isISO8601().withMessage('La fecha de caducidad debe ser válida'),
      body('estado')
        .optional()
        .isIn(['activo', 'agotado', 'vencido']).withMessage('Estado inválido'),
      BaseValidator.validate
    ];
  }
}

// Validador para perfiles de productor (SRP)
export class ProducerProfileValidator extends BaseValidator {
  static validateCreate() {
    return [
      body('nombre_negocio')
        .trim()
        .notEmpty()
        .withMessage('El nombre del negocio es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre del negocio debe tener al menos 3 caracteres'),
      body('ubicacion')
        .trim()
        .notEmpty()
        .withMessage('La ubicación es obligatoria'),
      body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no debe exceder 500 caracteres'),
      body('telefono')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('El teléfono debe ser válido'),
      body('whatsapp')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('El WhatsApp debe ser válido'),
      body('sitio_web')
        .optional()
        .isURL()
        .withMessage('El sitio web debe ser una URL válida'),
      BaseValidator.validate
    ];
  }

  static validateUpdate() {
    return [
      body('nombre_negocio')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('El nombre del negocio debe tener al menos 3 caracteres'),
      body('ubicacion')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('La ubicación no puede estar vacía'),
      body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no debe exceder 500 caracteres'),
      body('telefono')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('El teléfono debe ser válido'),
      body('whatsapp')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('El WhatsApp debe ser válido'),
      body('sitio_web')
        .optional()
        .isURL()
        .withMessage('El sitio web debe ser una URL válida'),
      BaseValidator.validate
    ];
  }
}

// Validador para carritos de compras (SRP: Responsabilidad única para validación de carritos)
export class CartValidator extends BaseValidator {
  static validateAddProduct() {
    return [
      body('productId')
        .notEmpty()
        .withMessage('El ID del producto es obligatorio')
        .isInt({ min: 1 })
        .withMessage('El ID del producto debe ser un número entero válido'),
      body('cantidad')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 100'),
      BaseValidator.validate
    ];
  }

  static validateUpdateQuantity() {
    return [
      body('cantidad')
        .notEmpty()
        .withMessage('La cantidad es obligatoria')
        .isInt({ min: 1, max: 100 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 100'),
      BaseValidator.validate
    ];
  }
}

// Validador para pedidos (SRP: Responsabilidad única para validación de pedidos)
export class OrderValidator extends BaseValidator {
  static validateCreate() {
    return [
      body('direccionEntrega')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La dirección de entrega no puede exceder 500 caracteres'),
      body('telefonoContacto')
        .optional()
        .trim()
        .matches(/^[\+]?[0-9\-\(\)\s]+$/)
        .withMessage('El formato del teléfono no es válido')
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres'),
      body('notasEspeciales')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Las notas especiales no pueden exceder 1000 caracteres'),
      body('fechaEstimadaEntrega')
        .optional()
        .isISO8601()
        .withMessage('La fecha de entrega debe tener un formato válido')
        .custom((value) => {
          const inputDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (inputDate < today) {
            throw new Error('La fecha de entrega no puede ser en el pasado');
          }
          return true;
        }),
      BaseValidator.validate
    ];
  }

  static validateUpdateStatus() {
    return [
      body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'])
        .withMessage('Estado de pedido inválido'),
      BaseValidator.validate
    ];
  }

  static validateOrderId() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del pedido debe ser un número entero válido'),
      BaseValidator.validate
    ];
  }
}

// Middleware reutilizable para validación de request
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de usuario inválidos',
      errors: errors.array()
    });
  }
  next();
}