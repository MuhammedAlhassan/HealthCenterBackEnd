import express from 'express';
import {
  createWeightEntry,
  getWeightEntries,
  deleteWeightEntry,
  getWeightGoal,
  setWeightGoal,
  getWeightProgress
} from '../controllers/weightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createWeightEntry)
  .get(protect, getWeightEntries);

router.route('/goal')
  .get(protect, getWeightGoal)
  .post(protect, setWeightGoal);

router.route('/progress')
  .get(protect, getWeightProgress);

router.route('/:id')
  .delete(protect, deleteWeightEntry);

export default router;