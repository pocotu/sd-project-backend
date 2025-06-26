import express from 'express';
import { ContactController } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/contacts - Create contact
router.post('/', ContactController.createContact);

// PATCH /api/contacts/:id/status - Update contact status (authenticated)
router.patch('/:id/status', authMiddleware, ContactController.updateContactStatus);

export default router;
