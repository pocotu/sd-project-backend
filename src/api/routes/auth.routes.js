import express from 'express';
import { body } from 'express-validator';
import { UserValidator, validateRequest } from '../middlewares/validation.middleware.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();
const authController = new AuthController();

// Rutas de autenticación
router.post(
  '/register',
  UserValidator.validateCreate(),
  authController.register.bind(authController)
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria'),
    validateRequest
  ],
  authController.login.bind(authController)
);

router.post(
  '/logout',
  AuthMiddleware.authenticate,
  authController.logout.bind(authController)
);

router.post(
  '/forgot-password',
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);

export default router; 