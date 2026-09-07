import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  toggleFavorite,
} from '../controllers/noteController.js';

const router = express.Router();

// All note routes are protected by JWT authentication
router.use(protect);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.put('/:id/favorite', toggleFavorite);

export default router;
