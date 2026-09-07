import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProgressOverview,
  getQuizPerformance,
  getRoadmapProgress,
  getFlashcardProgress,
  getSubjectPerformance,
} from '../controllers/progressController.js';

const router = express.Router();

// All progress routes are protected by JWT authentication
router.use(protect);

router.get('/overview', getProgressOverview);
router.get('/quiz', getQuizPerformance);
router.get('/roadmap', getRoadmapProgress);
router.get('/flashcards', getFlashcardProgress);
router.get('/subjects', getSubjectPerformance);

export default router;
