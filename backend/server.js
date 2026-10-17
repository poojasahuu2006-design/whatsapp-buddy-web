import app from './src/app.js';
import { config } from './src/config/config.js';
import { evolutionService } from './src/services/evolutionService.js';

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🚀 WhatsApp Buddy Node.js & Express Server Started`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`📱 Webhook Receiver: http://localhost:${PORT}/api/whatappbuddy`);
  console.log(`⚙️  Evolution Gateway: ${config.evolutionInstance}`);
  console.log(`=================================================`);

  // Auto-register webhook with Evolution API
  try {
    await evolutionService.configureWebhook();
  } catch (err) {
    console.warn('[Startup] Evolution API webhook setup deferred:', err.message);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
