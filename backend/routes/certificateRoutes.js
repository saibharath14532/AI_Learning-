import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCertificates,
  getCertificateById,
  checkCertificateEligibility,
  issueCertificate,
  verifyCertificate,
} from '../controllers/certificateController.js';

const router = express.Router();

// Public credential verification endpoint
router.get('/verify/:code', verifyCertificate);

// Protected routes (require JWT auth)
router.get('/', protect, getCertificates);
router.get('/:id', protect, getCertificateById);
router.get('/eligibility/:roadmapId', protect, checkCertificateEligibility);
router.post('/issue', protect, issueCertificate);

export default router;
