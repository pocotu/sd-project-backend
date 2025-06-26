import express from 'express';
import { SellerRatingController } from '../controllers/sellerRating.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/seller-ratings - Create seller rating (authenticated)
router.post('/', authMiddleware, SellerRatingController.createSellerRating);

// GET /api/seller-ratings - Get all seller ratings
router.get('/', SellerRatingController.getSellerRatings);

export default router;
