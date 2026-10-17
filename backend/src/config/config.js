import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  evolutionApiUrl: process.env.EVOLUTION_API_URL || 'https://cst-evolution-api-da141464-620b10de.cloud-station.app',
  evolutionInstance: process.env.EVOLUTION_INSTANCE || 'cs-cst-evolution-api-da141464',
  evolutionApiKey: process.env.EVOLUTION_API_KEY || '61C1EB49-2704-4D2C-B24B-A63A6F659F07',
  calendarEmail: process.env.CALENDAR_EMAIL || 'poojasahuu2006@gmail.com',
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',
  systemPrompt: 'You are a helpful assistant you will reply to the user query in the smartest possible way but in one sentence Dont extend the sentence',
  spreadsheetId: '1qWtucHwvHVXJAfzRPUnz12kQNX0EWFmkA9delB0I4LE',
  mongoUri: process.env.MONGODB_URI || ''
};
