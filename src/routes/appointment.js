import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getProviders
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', protect, getAppointments);
router.get('/providers', protect, getProviders);
router.post('/', protect, createAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

export default router;