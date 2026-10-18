import { Router } from 'express';
import { getContacts, getMessages, sendMessage, aiReply, getStats } from '../controllers/chatController.js';

const router = Router();

router.get('/stats', getStats);
router.get('/contacts', getContacts);
router.get('/chats', getContacts);
router.get('/chats/:jid/messages', getMessages);
router.post('/chats/send', sendMessage);
router.post('/chats/ai-reply', aiReply);

export default router;
