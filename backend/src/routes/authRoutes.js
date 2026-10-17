import { Router } from 'express';
import {
  getQrCode,
  getConnectionState,
  disconnect,
  createInstance,
  simulateConnection
} from '../controllers/authController.js';

const router = Router();

// QR code routes (supports both default and custom instance names)
router.get(['/qr', '/get-qr', '/get-qr/:instance'], getQrCode);

// Instance creation
router.post('/create-instance', createInstance);

// Connection status
router.get(['/connection-state', '/connection-state/:instance'], getConnectionState);

// Disconnect / Logout
router.post(['/disconnect', '/disconnect/:instance'], disconnect);

// Simulation toggle for local testing / CloudStation sleeping state
router.post('/simulate-connection', simulateConnection);

export default router;
