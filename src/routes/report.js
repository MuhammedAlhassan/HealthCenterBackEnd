// routes/reportRoutes.js
import express from 'express';
import {
  getReportByAppointmentId,
  createReport,
  updateReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:appointmentId')
  .get(protect, getReportByAppointmentId)
  .post(protect, createReport)
  .put(protect, updateReport);

export default router;