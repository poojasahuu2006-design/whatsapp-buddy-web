import { Router } from 'express';
import { simulate, getRuns, getAutomationConfig } from '../controllers/automationController.js';

const router = Router();

router.post('/automations/simulate', simulate);
router.get('/automations/runs', getRuns);
router.get('/automations/config', getAutomationConfig);

export default router;
