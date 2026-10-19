import { config } from '../config/config.js';
import { calendarService } from './calendarService.js';
import { findBestKnowledgeAnswer, KNOWLEDGE_BASE_ENTRIES } from './knowledgeBase.js';
import axios from 'axios';

export class AiAgentService {
  constructor() {
    this.calendarEmail = config.calendarEmail;
    this.timezone = config.timezone;
    this.spreadsheetId = config.spreadsheetId;
    this.systemPrompt = config.systemPrompt;
    this.openAiApiKey = process.env.OPENAI_API_KEY || '';
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
    const isGreeting = /^h+(i+|e+y*|e+l+o+)\b|^namaste|^pranam|^kaise ho|^kese ho|^good (morning|afternoon|evening)|^sup\b/i.test(textLower);

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
    } else if (isGreeting && textLower.length < 30) {
      toolUsed = 'OpenAI Chat Model (gpt-5-mini)';
      steps.push({
        node: 'AI Agent',
        status: 'done',
        detail: 'Processed greeting using Nexus Agency system prompt'
      });
      responseText = 'Hello! Welcome to Nexus Agency. We create autonomous WhatsApp AI agents, web apps, and business automations. How can we help you today?';
    } else {

      // Check Knowledge Base first
      const kbMatch = findBestKnowledgeAnswer(incomingText);

      // If OpenAI API key is available, optionally prompt OpenAI with KB context
      if (this.openAiApiKey) {
        try {
          toolUsed = 'OpenAI Chat Model (gpt-4o-mini)';
          const promptContext = kbMatch 
            ? `Relevant Knowledge Base Entry: [${kbMatch.entry.topic}]: ${kbMatch.entry.detailedContext}`
            : 'Knowledge Base: Nexus Agency builds WhatsApp AI agents ($499+), custom web apps ($999+), 5-14 day turnaround, 30-day warranty.';

          const aiRes = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `${this.systemPrompt}. You represent Nexus Agency. Context: ${promptContext}. Reply strictly in 1 smart, professional sentence.`
                },
                {
                  role: 'user',
                  content: incomingText
                }
              ],
              max_tokens: 120,
              temperature: 0.3
            },
            {
              headers: {
                Authorization: `Bearer ${this.openAiApiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 8000
            }
          );

          responseText = aiRes.data.choices?.[0]?.message?.content?.trim();
          steps.push({
            node: 'AI Agent (OpenAI)',
            status: 'done',
            detail: `Answered using GPT-4o-mini with Knowledge Base context on "${kbMatch ? kbMatch.entry.topic : 'General'}"`
          });
        } catch (err) {
          console.warn('[AiAgentService] OpenAI call failed, falling back to structured KB:', err.message);
        }
      }

      // If responseText is still empty (no OpenAI key or error), use structured KB or fallback
      if (!responseText) {
        if (kbMatch) {
          toolUsed = 'Get row(s) in sheet in Google Sheets';
          steps.push({
            node: 'Google Sheets Tool',
            status: 'done',
            detail: `Matched topic "${kbMatch.entry.topic}" in KnowledgeBase (${this.spreadsheetId})`
          });
          responseText = kbMatch.response;
        } else {
          toolUsed = 'OpenAI Chat Model (gpt-5-mini)';
          steps.push({
            node: 'AI Agent',
            status: 'done',
            detail: 'Processed general query using system prompt (1-sentence limit enforced)'
          });
          responseText = 'Nexus Agency builds autonomous WhatsApp AI bots ($499+), custom web applications ($999+), and workflow automations—how can we assist you today?';
        }

      }
    }

    return {
      responseText,
      toolUsed,
      steps
    };
  }
}

export const aiAgentService = new AiAgentService();

