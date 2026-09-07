import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizResults,
} from '../controllers/quizController.js';

const router = express.Router();

// Protect all routes with JWT authentication
router.use(protect);

router.post('/', createQuiz);
router.get('/', getQuizzes);
router.get('/history', getQuizHistory);
router.get('/:id', getQuizById);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);
router.post('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);

export default router;
