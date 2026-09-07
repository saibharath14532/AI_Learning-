import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
} from '../controllers/roadmapController.js';

const router = express.Router();

// All roadmap routes are protected by JWT authentication
router.use(protect);

router.post('/', createRoadmap);
router.get('/', getRoadmaps);
router.get('/:id', getRoadmapById);
router.put('/:id', updateRoadmap);
router.delete('/:id', deleteRoadmap);

export default router;
