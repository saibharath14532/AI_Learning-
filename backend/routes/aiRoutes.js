import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  explainTopic,
  solveDoubt,
  generateQuiz,
  generateRoadmap,
  generateFlashcards,
  generateNotes,
} from '../controllers/aiController.js';

const router = express.Router();

// Topic Explainer and Doubt Solver endpoints
router.post('/explain', explainTopic);
router.post('/doubt', solveDoubt);

// Authenticated AI Generator endpoints (require JWT)
router.post('/quiz/generate', protect, generateQuiz);
router.post('/roadmap/generate', protect, generateRoadmap);
router.post('/flashcards/generate', protect, generateFlashcards);
router.post('/notes/generate', protect, generateNotes);

export default router;
