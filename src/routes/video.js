import express from 'express';
import {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo
} from '../controllers/videoController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getVideos)
  .post(protect, authorize('admin'), createVideo);

router.route('/:id')
  .get(getVideo)
  .put(protect, authorize('admin'), updateVideo)
  .delete(protect, authorize('admin'), deleteVideo);

export default router;