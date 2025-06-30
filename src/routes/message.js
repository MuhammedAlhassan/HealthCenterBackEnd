import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:callId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;