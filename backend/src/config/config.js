import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded reliably regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  evolutionApiUrl: (process.env.EVOLUTION_API_URL || 'http://localhost:8080').replace(/\/+$/, ''),
  evolutionInstance: process.env.EVOLUTION_INSTANCE || 'cs-cst-evolution-api-da141464',
  evolutionApiKey: process.env.EVOLUTION_API_KEY || '61C1EB49-2704-4D2C-B24B-A63A6F659F07',
  calendarEmail: process.env.CALENDAR_EMAIL || 'poojasahuu2006@gmail.com',
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',
  systemPrompt: 'You are the official AI assistant for Nexus Agency. Reply strictly in ONE concise, punchy sentence. Nexus builds WhatsApp AI bots ($499 / ₹39,999) and custom web apps ($999 / ₹79,999) with 5 to 14-day turnaround and 30 days of free support. When asked to schedule a call, guide them to book a 30-minute discovery call on Google Calendar with poojasahuu2006@gmail.com.',
  spreadsheetId: '1qWtucHwvHVXJAfzRPUnz12kQNX0EWFmkA9delB0I4LE',
  mongoUri: process.env.MONGODB_URI || ''
};

