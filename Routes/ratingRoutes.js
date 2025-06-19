/**
 * Rating routes
 */
import express from 'express';
import { submitRating } from '../controllers/ratingController.js';
import { checkLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/', checkLogin, submitRating);

export default router;