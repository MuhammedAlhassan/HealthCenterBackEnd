import express from 'express';
import { 
  getProfile, 
  updateProfile,
  uploadProfilePicture,
  updateHealthProfile
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/picture')
  .post(protect, upload.single('image'), uploadProfilePicture);

router.route('/health')
  .put(protect, updateHealthProfile);

export default router;