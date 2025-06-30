import express from 'express';
import { initiateCall, endCall, requestAction } from '../controllers/callController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', protect, initiateCall);
router.put('/:id/end', protect, endCall);
router.post('/:id/actions', protect, requestAction);

export default router;