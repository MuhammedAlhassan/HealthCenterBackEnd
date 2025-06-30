import express from 'express';
import {
  triggerEmergency,
  updateEmergency,
  getEmergencies
} from '../controllers/emergency.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, triggerEmergency)
  .get(protect, getEmergencies);

router.route('/:id')
  .put(protect, authorize('admin', 'clinic'), updateEmergency);

export default router;