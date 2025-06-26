import express from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/reviews - Create review (authenticated)
router.post('/', authMiddleware, ReviewController.createReview);

// GET /api/reviews - Get all reviews
router.get('/', ReviewController.getReviews);

export default router;
