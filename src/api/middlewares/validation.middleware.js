import { validationResult, body } from 'express-validator';
import { AppError } from './error.middleware.js';

// Clase base para validadores (OCP: Abierto para extensión)
export class BaseValidator {
  static validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Datos de usuario inválidos', 400, errors.array());
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
      BaseValidator.validate
    ];
  }
}

// Middleware reutilizable para validación de request
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Datos de usuario inválidos',
      errors: errors.array()
    });
  }
  next();
} 