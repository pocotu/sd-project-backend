import express from 'express';
import { ProducerProfileController } from '../controllers/producerProfile.controller.js';
import { ProducerProfileValidator } from '../middlewares/validation.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const controller = new ProducerProfileController();

// Todas requieren autenticación
router.get('/', authMiddleware, controller.getMyProfile); // GET /api/producer-profile - get current user's profile
router.post('/', authMiddleware, ProducerProfileValidator.validateCreate(), controller.create);
router.put('/', authMiddleware, ProducerProfileValidator.validateUpdate(), controller.update);
router.delete('/', authMiddleware, controller.delete); // DELETE /api/producer-profile
router.get('/me', authMiddleware, controller.getMyProfile); // Backward compatibility for /me endpoint

export default router;
