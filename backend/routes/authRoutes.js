import express from 'express';
import { register, login, getCurrentUser, logout, verifyEmail, resendVerificationCode, getVerificationCode } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/verify-otp', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/resend-otp', resendVerificationCode);
router.post('/get-code', getVerificationCode);


// Protected routes
router.get('/me', protect, getCurrentUser);

export default router;
