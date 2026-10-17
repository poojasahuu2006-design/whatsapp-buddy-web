import { Router } from 'express';
import authRoutes from './authRoutes.js';
import chatRoutes from './chatRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import automationRoutes from './automationRoutes.js';
import calendarRoutes from './calendarRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    framework: 'Node.js & Express'
  });
});

// Mount modules
router.use('/', authRoutes);
router.use('/', chatRoutes);
router.use('/', webhookRoutes);
router.use('/', automationRoutes);
router.use('/', calendarRoutes);

export default router;
