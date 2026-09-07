import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getStats,
  getDashboard
} from '../controllers/userController.js';

const router = express.Router();

// All routes here are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/stats', getStats);
router.get('/dashboard', getDashboard);

export default router;
