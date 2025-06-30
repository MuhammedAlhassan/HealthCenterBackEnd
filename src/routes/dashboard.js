import express from 'express';
import { getDashboard, updateDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getDashboard)
  .put(protect, updateDashboard);

export default router