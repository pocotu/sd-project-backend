import express from 'express';
import { AuthValidator } from '../middlewares/auth.validation.middleware.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();
const authController = new AuthController();

// Rutas de autenticación
router.post(
  '/register',
  AuthValidator.validateRegister(),
  authController.register.bind(authController)
);

router.post(
  '/login',
  AuthValidator.validateLogin(),
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