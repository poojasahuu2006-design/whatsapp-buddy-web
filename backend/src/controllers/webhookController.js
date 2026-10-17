import { aiAgentService } from '../services/aiAgentService.js';
import { evolutionService } from '../services/evolutionService.js';
import { executionRuns } from './automationController.js';

export const handleWebhook = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const payload = req.body;
    
    // Normalize Evolution API structure: payload.data or payload.body.data (handles both object and array)
    let rawData = payload?.data || payload?.body?.data || payload;
    if (Array.isArray(rawData)) {
      rawData = rawData[0] || {};
    }
    const data = rawData;
    const key = data?.key || {};
    const fromMe = key?.fromMe === true;

    // Filter: Ignore outgoing messages from the bot itself
    if (fromMe) {
      return res.status(200).json({
        node: 'No Operation, do nothing',
        status: 'skipped',
        message: 'Ignoring outgoing message (fromMe === true)'
      });
    }

    const remoteJid = key?.remoteJid || '';

    // Ignore WhatsApp status updates, broadcast channels, groups, and LID identifiers
    if (!remoteJid || remoteJid.includes('@broadcast') || remoteJid.includes('@lid') || remoteJid.endsWith('@g.us')) {
      return res.status(200).json({
        node: 'No Operation',
        status: 'skipped',
        message: 'Ignoring status broadcast, group, or system message'
      });
    }

    const recipientNumber = remoteJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
    const messageObj = data?.message || {};
    const incomingText = 
      messageObj?.conversation ||
      messageObj?.extendedTextMessage?.text ||
      messageObj?.imageMessage?.caption ||
      messageObj?.videoMessage?.caption ||
      messageObj?.documentMessage?.caption ||
      data?.text ||
      '';

    if (!incomingText.trim()) {
      return res.status(200).json({
        node: 'No Operation',
        status: 'skipped',
        message: 'No text or caption content found'
      });
    }

    console.log(`\n======================================================`);
    console.log(`📩 [WhatsApp Webhook] Incoming Message from: +${recipientNumber}`);
    console.log(`💬 Message: "${incomingText}"`);

    // Run AI Agent reasoning & tool execution
    const { responseText, toolUsed, steps } = await aiAgentService.processMessage(incomingText, recipientNumber);

    console.log(`🤖 [Nexus Company AI Reply]: "${responseText}"`);

    // Dispatches message back via Evolution API
    const dispatchResult = await evolutionService.sendTextMessage(recipientNumber, responseText);
    
    console.log(`📤 [Evolution API Dispatch Status]:`, dispatchResult.success ? 'SUCCESS (Message Sent)' : `FAILED: ${dispatchResult.error}`);
    console.log(`======================================================\n`);
    
    steps.push({
      node: 'HTTP Request (Evolution API)',
      status: dispatchResult.success ? 'done' : 'warning',
      detail: dispatchResult.success 
        ? `Successfully sent reply to +${recipientNumber} via Evolution API`
        : `Sent payload to Evolution API endpoint (${dispatchResult.error || 'simulated mode'})`
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

    const runRecord = {
      id: 'run-' + Date.now(),
      name: 'Whatapp_Agent: Incoming WhatsApp',
      status: dispatchResult.success ? 'success' : 'warning',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      sender: recipientNumber,
      message: incomingText,
      reply: responseText,
      toolUsed,
      steps
    };

    executionRuns.unshift(runRecord);
    if (executionRuns.length > 50) executionRuns.pop();

    return res.status(200).json({
      status: 'success',
      automation: 'Whatapp_Agent',
      output: responseText,
      run: runRecord
    });
  } catch (error) {
    next(error);
  }
};
