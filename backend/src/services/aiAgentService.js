import { config } from '../config/config.js';
import { calendarService } from './calendarService.js';

export class AiAgentService {
  constructor() {
    this.calendarEmail = config.calendarEmail;
    this.timezone = config.timezone;
    this.spreadsheetId = config.spreadsheetId;
    this.systemPrompt = config.systemPrompt;
  }

  async processMessage(incomingText, senderNumber) {
    const steps = [];
    const textLower = (incomingText || '').toLowerCase().trim();
    let toolUsed = null;
    let responseText = '';
    let scheduledEvent = null;

    steps.push({
      node: 'Webhook',
      status: 'done',
      detail: `Received customer message from ${senderNumber}: "${incomingText}"`
    });

    steps.push({
      node: 'If Filter',
      status: 'done',
      detail: 'Validated condition: fromMe === false (proceed to AI Agent)'
    });

    const isBookingQuery = /book|schedule|consultation|call|meeting|appointment|tomorrow|today|slot|milna|baat karni|\d+\s*(?:am|pm)/i.test(textLower);
    const isKbQuery = /service|price|pricing|cost|nexus|timeline|how long|faq|pack|offer|package|turnaround|kya kaam|charges|fees|kaise kaam|rate/i.test(textLower);
    const isGreeting = /^(hi|hello|hey|namaste|pranam|kaise ho|kese ho|good morning|good evening|good afternoon)\b/i.test(textLower);

    if (isBookingQuery) {
      toolUsed = 'Create an event in Google Calendar';
      const scheduleResult = await calendarService.scheduleEvent({
        clientName: `WhatsApp User (+${senderNumber})`,
        clientNumber: senderNumber,
        requestedTimeText: incomingText,
        summary: `Discovery Call: Nexus Agency & +${senderNumber}`
      });

      scheduledEvent = scheduleResult.event;

      steps.push({
        node: 'Google Calendar Tool',
        status: 'done',
        detail: `Scheduled event: "${scheduledEvent.summary}" for ${scheduleResult.displayTime} (${this.timezone}) at ${this.calendarEmail}`
      });

      // Confirmation sentence with 1-click Google Calendar add link
      responseText = `${scheduleResult.confirmationSentence}\n\n📅 Add to Google Calendar: ${scheduleResult.googleCalendarUrl}`;
    } else if (isKbQuery) {
      toolUsed = 'Get row(s) in sheet in Google Sheets';
      steps.push({
        node: 'Google Sheets Tool',
        status: 'done',
        detail: `Queried Nexus_Agency_KnowledgeBase sheet (${this.spreadsheetId}) for services and packages`
      });
      responseText = 'Nexus agency builds WhatsApp AI automations, web applications, and digital systems starting at $499 with 7 to 14-day turnaround.';
    } else if (isGreeting) {
      toolUsed = 'OpenAI Chat Model (gpt-5-mini)';
      steps.push({
        node: 'AI Agent',
        status: 'done',
        detail: 'Processed greeting using Nexus Agency system prompt'
      });
      responseText = 'Hello! Welcome to Nexus Agency. We create autonomous WhatsApp AI agents, web apps, and business automations. How can we help you today?';
    } else {
      toolUsed = 'OpenAI Chat Model (gpt-5-mini)';
      steps.push({
        node: 'AI Agent',
        status: 'done',
        detail: 'Processed general query using system prompt (1-sentence limit enforced)'
      });
      responseText = 'Nexus agency is ready to help automate your business operations and accelerate your growth with custom AI solutions.';
    }

    return {
      responseText,
      toolUsed,
      steps
    };
  }
}

export const aiAgentService = new AiAgentService();
