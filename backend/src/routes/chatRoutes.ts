import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);

export default router;
