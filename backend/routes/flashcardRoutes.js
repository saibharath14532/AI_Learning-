import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createFlashcardSet,
  getFlashcardSets,
  getFlashcardSetById,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateCardProgress,
} from '../controllers/flashcardController.js';

const router = express.Router();

// All flashcard routes are protected by JWT authentication
router.use(protect);

router.post('/', createFlashcardSet);
router.get('/', getFlashcardSets);
router.get('/:id', getFlashcardSetById);
router.put('/:id', updateFlashcardSet);
router.delete('/:id', deleteFlashcardSet);
router.put('/:id/progress', updateCardProgress);

export default router;
