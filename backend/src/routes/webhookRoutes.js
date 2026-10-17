import { Router } from 'express';
import { handleWebhook } from '../controllers/webhookController.js';

const router = Router();

// Handles incoming WhatsApp messages from Evolution API / n8n
router.post(['/whatappbuddy', '/webhook'], handleWebhook);

export default router;
