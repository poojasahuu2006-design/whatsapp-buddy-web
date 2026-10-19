import { aiAgentService } from '../services/aiAgentService.js';
import { evolutionService } from '../services/evolutionService.js';
import { executionRuns } from './automationController.js';
import { MessageLog } from '../models/MessageLog.js';
import { Lead } from '../models/Lead.js';

// In-memory deduplication cache to prevent duplicate AI responses (e.g. Baileys socket + HTTP webhook dual trigger)
const processedMessagesCache = new Map();

// Periodically clean up entries older than 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of processedMessagesCache.entries()) {
    if (now - timestamp > 30000) {
      processedMessagesCache.delete(key);
    }
  }
}, 15000);

export const processIncomingMessage = async (data) => {
  const startTime = Date.now();
  const key = data?.key || {};
  const fromMe = key?.fromMe === true;

  // Filter: Ignore outgoing messages from the bot itself
  if (fromMe) {
    return { status: 'skipped', message: 'Ignoring outgoing message (fromMe === true)' };
  }

  const remoteJid = key?.remoteJid || '';
  const remoteJidAlt = key?.remoteJidAlt || data?.sender || '';

  // Ignore WhatsApp status updates, broadcast channels, and group chats
  if (!remoteJid || remoteJid.includes('@broadcast') || remoteJid.endsWith('@g.us')) {
    return { status: 'skipped', message: 'Ignoring status broadcast or group message' };
  }

  // Determine target recipient (handles both regular phone JID and modern WhatsApp LID)
  let recipientNumber = '';
  if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
    recipientNumber = remoteJidAlt.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
  } else if (remoteJid.includes('@s.whatsapp.net')) {
    recipientNumber = remoteJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
  } else if (remoteJid.includes('@lid')) {
    recipientNumber = remoteJidAlt ? remoteJidAlt.replace(/[^0-9]/g, '') : remoteJid;
  } else {
    recipientNumber = remoteJid.replace(/[^0-9]/g, '');
  }

  const { extractMessageText } = await import('../services/evolutionService.js');
  const incomingText = extractMessageText(data) ||
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text ||
    data?.text ||
    '';

  if (!incomingText.trim()) {
    return { status: 'skipped', message: 'No text or caption content found' };
  }

  // Bulletproof Deduplication: Check message ID and sender:content signature
  const messageId = key?.id || data?.id || data?.messageId;
  const dedupKeyId = messageId ? `id:${messageId}` : null;
  const dedupKeyContent = `msg:${remoteJid || recipientNumber}:${incomingText.trim().toLowerCase()}`;

  const now = Date.now();
  if (
    (dedupKeyId && processedMessagesCache.has(dedupKeyId) && (now - processedMessagesCache.get(dedupKeyId)) < 20000) ||
    (processedMessagesCache.has(dedupKeyContent) && (now - processedMessagesCache.get(dedupKeyContent)) < 10000)
  ) {
    console.log(`⚡ [Deduplication] Dropping duplicate incoming message trigger from ${remoteJid || recipientNumber} ("${incomingText.slice(0, 30)}...")`);
    return { status: 'skipped', message: 'Duplicate message already being processed' };
  }

  // Register in deduplication cache
  if (dedupKeyId) processedMessagesCache.set(dedupKeyId, now);
  processedMessagesCache.set(dedupKeyContent, now);

  console.log(`\n======================================================`);
  console.log(`📩 [WhatsApp Webhook] Incoming Message from: ${remoteJid || recipientNumber}`);
  console.log(`💬 Message: "${incomingText}"`);


  // Run AI Agent reasoning & tool execution
  const { responseText, toolUsed, steps } = await aiAgentService.processMessage(incomingText, recipientNumber || remoteJid);

  console.log(`🤖 [Nexus Company AI Reply]: "${responseText}"`);

  // Dispatches message back directly to sender (prioritize standard phone JID for delivery)
  let targetRecipient = remoteJid;
  if (recipientNumber && /^\d{6,}$/.test(recipientNumber)) {
    targetRecipient = `${recipientNumber}@s.whatsapp.net`;
  } else if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
    targetRecipient = remoteJidAlt;
  }

  const dispatchResult = await evolutionService.sendTextMessage(targetRecipient, responseText);
  
  console.log(`📤 [WhatsApp Dispatch Status]:`, dispatchResult.success ? `SUCCESS (Message Sent to ${targetRecipient})` : `FAILED: ${dispatchResult.error}`);
  console.log(`======================================================\n`);

  // Persist conversation and update lead profile in MongoDB
  try {
    await MessageLog.create({
      senderNumber: recipientNumber,
      senderName: data?.pushName || 'Customer',
      customerMessage: incomingText,
      aiReply: responseText,
      toolUsed: toolUsed || 'None',
      status: dispatchResult.success ? 'delivered' : 'failed'
    });

    await Lead.findOneAndUpdate(
      { phoneNumber: recipientNumber },
      {
        $set: {
          name: data?.pushName || undefined,
          lastMessage: incomingText,
          lastActive: new Date(),
          leadStatus: toolUsed?.includes('Calendar') ? 'Booked Call' : 'Inquiry'
        },
        $inc: { messageCount: 1 }
      },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    // Non-blocking in case MongoDB is temporarily unreachable
  }
  
  steps.push({
    node: 'WhatsApp Dispatch',
    status: dispatchResult.success ? 'done' : 'warning',
    detail: dispatchResult.success 
      ? `Successfully sent reply to +${recipientNumber}`
      : `Failed to dispatch WhatsApp message (${dispatchResult.error || 'simulated mode'})`
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

  const runRecord = {
    id: 'run-' + Date.now(),
    name: 'Whatapp_Agent: Incoming WhatsApp',
    status: dispatchResult.success ? 'success' : 'warning',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration,
    sender: recipientNumber,
    lastNode: toolUsed || 'AI Agent Intent Routing',
    steps: steps.map((s, idx) => ({ id: idx + 1, name: s.node, status: s.status, detail: s.detail }))
  };

  executionRuns.unshift(runRecord);
  if (executionRuns.length > 20) executionRuns.pop();

  return {
    status: 'success',
    incomingMessage: incomingText,
    reply: responseText,
    recipient: recipientNumber,
    toolExecuted: toolUsed,
    dispatchResult,
    duration
  };
};

export const handleWebhook = async (req, res, next) => {
  try {
    const payload = req.body;
    let rawData = payload?.data || payload?.body?.data || payload;
    if (Array.isArray(rawData)) {
      rawData = rawData[0] || {};
    }
    const result = await processIncomingMessage(rawData);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
