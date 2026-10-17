import { evolutionService } from '../services/evolutionService.js';
import { aiAgentService } from '../services/aiAgentService.js';
import { executionRuns } from './automationController.js';

export const getContacts = async (req, res, next) => {
  try {
    const connState = await evolutionService.getConnectionState();
    const chatsResult = await evolutionService.getChats();

    // If chats/contacts exist in database from WhatsApp sync, return them!
    if (chatsResult.chats && chatsResult.chats.length > 0) {
      return res.json({
        ...chatsResult,
        connected: connState.state === 'open' || chatsResult.chats.length > 0,
        state: connState.state
      });
    }

    if (connState.state !== 'open') {
      return res.json({
        success: false,
        connected: false,
        state: connState.state,
        message: 'WhatsApp is not connected. Scan the QR code in Linked Devices to connect.',
        chats: [],
        total: 0
      });
    }

    res.json({
      ...chatsResult,
      connected: true,
      state: 'open'
    });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { jid } = req.params;
    const messagesResult = await evolutionService.getMessages(jid);
    res.json(messagesResult);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { number, text } = req.body;
    if (!number || !text) {
      return res.status(400).json({ success: false, error: 'number and text are required' });
    }

    const dispatchResult = await evolutionService.sendTextMessage(number, text);
    res.json(dispatchResult);
  } catch (err) {
    next(err);
  }
};

export const aiReply = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { number, lastCustomerMessage } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: 'number is required' });
    }

    const { responseText, toolUsed, steps } = await aiAgentService.processMessage(
      lastCustomerMessage || 'Hello Nexus',
      number
    );

    const dispatchResult = await evolutionService.sendTextMessage(number, responseText);

    steps.push({
      node: 'Evolution API Dispatch',
      status: dispatchResult.success ? 'done' : 'warning',
      detail: dispatchResult.success
        ? `Sent 1-sentence AI reply to +${number}`
        : `Attempted dispatch (${dispatchResult.error || 'Connection Closed'})`
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

    const runRecord = {
      id: 'ai-chat-' + Date.now(),
      name: `Whatapp_Agent: Reply to +${number}`,
      status: 'success',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      sender: number,
      message: lastCustomerMessage,
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
      dispatched: dispatchResult.success,
      dispatchError: dispatchResult.error,
      run: runRecord
    });
  } catch (err) {
    next(err);
  }
};
