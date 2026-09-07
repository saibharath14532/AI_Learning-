import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  getAnalytics,
  getAllRoadmaps,
  getAllQuizzes,
  getAllFlashcards,
  getAllNotes,
  getAllCertificates,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth + admin protection to ALL admin routes
router.use(protect);
router.use(adminMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.get('/analytics', getAnalytics);
router.get('/roadmaps', getAllRoadmaps);
router.get('/quizzes', getAllQuizzes);
router.get('/flashcards', getAllFlashcards);
router.get('/notes', getAllNotes);
router.get('/certificates', getAllCertificates);

export default router;
