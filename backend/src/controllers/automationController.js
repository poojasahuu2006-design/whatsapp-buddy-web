import { aiAgentService } from '../services/aiAgentService.js';
import { evolutionService } from '../services/evolutionService.js';
import { config } from '../config/config.js';

export let executionRuns = [
  {
    id: 'run-init-1',
    name: 'Whatapp_Agent: Consultation Booking',
    status: 'success',
    timestamp: '12:53 AM',
    duration: '1.24s',
    sender: '919876543210',
    message: 'Can I schedule a consultation call tomorrow at 4 PM?',
    reply: "Your consultation meeting with Nexus agency has been booked for tomorrow on Google Calendar at poojasahuu2006@gmail.com.",
    steps: [
      { node: 'Webhook', status: 'done', detail: 'Received Evolution API payload for 919876543210' },
      { node: 'If Filter', status: 'done', detail: 'fromMe is false (Customer message)' },
      { node: 'Google Calendar Tool', status: 'done', detail: 'Invoked Google Calendar tool for poojasahuu2006@gmail.com' },
      { node: 'HTTP Request', status: 'done', detail: 'Sent WhatsApp text via Evolution API' }
    ]
  },
  {
    id: 'run-init-2',
    name: 'Whatapp_Agent: Services Inquiry',
    status: 'success',
    timestamp: '12:52 AM',
    duration: '0.88s',
    sender: '15550142893',
    message: 'What services does Nexus agency offer and what is the starting price?',
    reply: 'Nexus agency builds WhatsApp AI automations, web applications, and digital systems starting at $499 with 7 to 14-day turnaround.',
    steps: [
      { node: 'Webhook', status: 'done', detail: 'Received Evolution API payload for 15550142893' },
      { node: 'If Filter', status: 'done', detail: 'fromMe is false (Customer message)' },
      { node: 'Google Sheets Tool', status: 'done', detail: 'Queried Nexus KnowledgeBase Sheet (Sheet1)' },
      { node: 'HTTP Request', status: 'done', detail: 'Sent WhatsApp text via Evolution API' }
    ]
  }
];

export const getRuns = (req, res) => {
  res.json({
    total: executionRuns.length,
    runs: executionRuns
  });
};

export const simulate = async (req, res, next) => {
  const startTime = Date.now();
  const { message = 'What services does Nexus agency offer?', number = '919876543210' } = req.body;

  try {
    const { responseText, toolUsed, steps } = await aiAgentService.processMessage(message, number);
    const dispatchResult = await evolutionService.sendTextMessage(number, responseText);

    steps.push({
      node: 'HTTP Request (Evolution API)',
      status: 'done',
      detail: `Dispatched 1-sentence response to +${number}`
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

    const runRecord = {
      id: 'sim-' + Date.now(),
      name: 'Whatapp_Agent (Interactive Test)',
      status: 'success',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      sender: number,
      message,
      reply: responseText,
      toolUsed,
      steps
    };

    executionRuns.unshift(runRecord);
    if (executionRuns.length > 50) executionRuns.pop();

    res.json({
      success: true,
      reply: responseText,
      toolUsed,
      duration,
      run: runRecord
    });
  } catch (err) {
    next(err);
  }
};

export const getAutomationConfig = (req, res) => {
  res.json({
    name: 'Whatapp_Agent',
    version: '2.1',
    active: true,
    webhookPath: '/api/whatappbuddy',
    evolutionInstance: config.evolutionInstance,
    evolutionApiUrl: config.evolutionApiUrl,
    calendarEmail: config.calendarEmail,
    timezone: config.timezone
  });
};
