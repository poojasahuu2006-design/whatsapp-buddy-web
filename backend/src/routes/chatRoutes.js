import { Router } from 'express';
import { getContacts, getMessages, sendMessage, aiReply } from '../controllers/chatController.js';

const router = Router();

router.get('/contacts', getContacts);
router.get('/chats', getContacts);
router.get('/chats/:jid/messages', getMessages);
router.post('/chats/send', sendMessage);
router.post('/chats/ai-reply', aiReply);

export default router;
