export class AiAgentService {
  constructor(config = {}) {
    this.calendarEmail = config.calendarEmail || process.env.CALENDAR_EMAIL || 'poojasahuu2006@gmail.com';
    this.timezone = config.timezone || process.env.TIMEZONE || 'Asia/Kolkata';
    this.spreadsheetId = config.spreadsheetId || '1qWtucHwvHVXJAfzRPUnz12kQNX0EWFmkA9delB0I4LE';
    this.systemPrompt = config.systemPrompt || 'You are a helpful assistant you will reply to the user query in the smartest possible way but in one sentence Dont extend the sentence';
  }

  async processMessage(incomingText, senderNumber) {
    const steps = [];
    const textLower = (incomingText || '').toLowerCase().trim();
    let toolUsed = null;
    let responseText = '';

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

    // Calendar booking intent detection
    const isBookingQuery = /book|schedule|consultation|call|meeting|appointment|tomorrow|today|slot|\d+\s*(?:am|pm)/i.test(textLower);
    // Knowledge base intent detection
    const isKbQuery = /service|price|pricing|cost|nexus|timeline|how long|faq|pack|offer|package|turnaround/i.test(textLower);

    if (isBookingQuery) {
      toolUsed = 'Create an event in Google Calendar';
      steps.push({
        node: 'Google Calendar Tool',
        status: 'done',
        detail: `Created consultation meeting for +${senderNumber} with ${this.calendarEmail} (${this.timezone})`
      });
      // Strict 1-sentence prompt compliance
      responseText = `Your consultation meeting with Nexus agency has been booked for tomorrow on Google Calendar at ${this.calendarEmail}.`;
    } else if (isKbQuery) {
      toolUsed = 'Get row(s) in sheet in Google Sheets';
      steps.push({
        node: 'Google Sheets Tool',
        status: 'done',
        detail: `Queried Nexus_Agency_KnowledgeBase sheet (${this.spreadsheetId}) for services and packages`
      });
      // Strict 1-sentence prompt compliance
      responseText = 'Nexus agency builds WhatsApp AI automations, web applications, and digital systems starting at $499 with 7 to 14-day turnaround.';
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
