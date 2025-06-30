import express from 'express';
import {
  getClinics,
  getClinic,
  createClinic,
  updateClinic,
  deleteClinic,
  getNearbyClinics
} from '../controllers/clinics.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getClinics)
  .post(protect, authorize('admin'), createClinic);

router.route('/nearby')
  .get(getNearbyClinics);

router.route('/:id')
  .get(getClinic)
  .put(protect, authorize('admin'), updateClinic)
  .delete(protect, authorize('admin'), deleteClinic);

export default router;