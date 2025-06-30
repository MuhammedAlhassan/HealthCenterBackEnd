import express from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/articleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getArticles)
  .post(protect, authorize('admin'), createArticle);

router.route('/:id')
  .get(getArticle)
  .put(protect, authorize('admin'), updateArticle)
  .delete(protect, authorize('admin'), deleteArticle);

export default router;