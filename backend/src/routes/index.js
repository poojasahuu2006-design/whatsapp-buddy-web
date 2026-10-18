import { Router } from 'express';
import authRoutes from './authRoutes.js';
import chatRoutes from './chatRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import automationRoutes from './automationRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import { Lead } from '../models/Lead.js';
import { MessageLog } from '../models/MessageLog.js';
import { config } from '../config/config.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    framework: 'Node.js & Express',
    evolutionApiUrl: process.env.EVOLUTION_API_URL || 'not-set-in-env',
    effectiveApiUrl: config.evolutionApiUrl
  });
});

// View MongoDB database records directly from browser
router.get('/db/leads', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ updatedAt: -1 });
    res.json({ success: true, count: leads.length, database: 'whatsapp_buddy', collection: 'leads', leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/db/logs', async (req, res) => {
  try {
    const logs = await MessageLog.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, database: 'whatsapp_buddy', collection: 'messagelogs', logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount modules
router.use('/', authRoutes);
router.use('/', chatRoutes);
router.use('/', webhookRoutes);
router.use('/', automationRoutes);
router.use('/', calendarRoutes);

export default router;
