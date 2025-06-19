/**
 * Authentication routes
 */
import express from 'express';
import {
  register,
  login,
  checkUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { checkLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/checkUser', checkLogin, checkUser);

export default router;