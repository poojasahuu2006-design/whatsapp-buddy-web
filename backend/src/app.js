import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { handleWebhook } from './controllers/webhookController.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Primary API Router
app.use('/api', routes);

// Alias root webhook paths matching exact n8n webhook path /whatappbuddy
app.post(['/whatappbuddy', '/webhook'], handleWebhook);

// Serve Frontend Static files from frontend/dist
app.use(express.static(frontendDist));

// SPA Fallback for all other routes to serve React frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/whatappbuddy' || req.path === '/webhook') {
    return next();
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      // If frontend/dist is not built yet, fallback to API status
      res.json({
        name: 'WhatsApp Buddy API',
        status: 'running',
        framework: 'Node.js & Express'
      });
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
