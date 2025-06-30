import express from 'express';
import {
  analyzeVoiceSymptoms,
  getVoiceAnalysisHistory,
  getVoiceAnalysisById
} from '../controllers/voiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeVoiceSymptoms);
router.get('/history', protect, getVoiceAnalysisHistory);
router.get('/:id', protect, getVoiceAnalysisById);

export default router;