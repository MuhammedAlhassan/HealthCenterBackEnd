import express from 'express';
import {
  saveSession,
  getHistory,
  deleteSession
} from '../controllers/kickController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, saveSession)    // Save new session
  .get(protect, getHistory);    // Get user's history

router.route('/:id')
  .delete(protect, deleteSession); // Delete session

export default router;