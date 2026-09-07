import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStudyStreak,
  getStudyCalendar,
  getWeeklyActivity,
} from '../controllers/streakController.js';

const router = express.Router();

// All study streak routes are protected by JWT authentication
router.use(protect);

router.get('/', getStudyStreak);
router.get('/calendar', getStudyCalendar);
router.get('/weekly', getWeeklyActivity);

export default router;
