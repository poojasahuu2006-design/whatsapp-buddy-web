import axios from 'axios';
import { config } from '../config/config.js';
import { nativeBaileysService } from './nativeBaileysService.js';

// Helper to check if a string is basically just a phone number
export function isPhoneNumber(str) {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim();
  return /^\+?[\d\s\-()]{6,}$/.test(clean);
}

// Helper to extract clean text from any WhatsApp message payload
export function extractMessageText(lm) {
  if (!lm) return '';
  if (typeof lm === 'string') {
    const trimmed = lm.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return extractMessageText(JSON.parse(trimmed));
      } catch {}
    }
    return trimmed;
  }

  let msgObj = lm;
  if (lm.message) {
    if (typeof lm.message === 'string') {
      try {
        msgObj = JSON.parse(lm.message);
      } catch {
        msgObj = lm.message;
      }
    } else {
      msgObj = lm.message;
    }
  }

  if (typeof msgObj === 'string') return msgObj.trim();

  // Handle nested messages like ephemeralMessage or viewOnceMessage
  if (msgObj.ephemeralMessage?.message) msgObj = msgObj.ephemeralMessage.message;
  if (msgObj.viewOnceMessage?.message) msgObj = msgObj.viewOnceMessage.message;
  if (msgObj.viewOnceMessageV2?.message) msgObj = msgObj.viewOnceMessageV2.message;

  if (msgObj.conversation && typeof msgObj.conversation === 'string') {
    return msgObj.conversation.trim();
  }
  if (msgObj.extendedTextMessage?.text && typeof msgObj.extendedTextMessage.text === 'string') {
    return msgObj.extendedTextMessage.text.trim();
  }
  if (msgObj.imageMessage?.caption) return `📷 ${msgObj.imageMessage.caption.trim()}`;
  if (msgObj.imageMessage) return '📷 Photo';
  if (msgObj.videoMessage?.caption) return `🎥 ${msgObj.videoMessage.caption.trim()}`;
  if (msgObj.videoMessage) return '🎥 Video';
  if (msgObj.audioMessage) return '🎵 Voice message';
  if (msgObj.documentMessage?.fileName) return `📄 ${msgObj.documentMessage.fileName}`;
  if (msgObj.documentMessage) return '📄 Document';
  if (msgObj.stickerMessage) return '✨ Sticker';
  if (msgObj.contactMessage?.displayName) return `👤 ${msgObj.contactMessage.displayName}`;
  if (msgObj.contactMessage) return '👤 Contact card';
  if (msgObj.locationMessage) return '📍 Location';

  if (msgObj.body && typeof msgObj.body === 'string') return msgObj.body.trim();
  if (msgObj.text && typeof msgObj.text === 'string') return msgObj.text.trim();
  if (msgObj.content && typeof msgObj.content === 'string') return msgObj.content.trim();
  if (lm.body && typeof lm.body === 'string') return lm.body.trim();
  if (lm.text && typeof lm.text === 'string') return lm.text.trim();
  if (lm.content && typeof lm.content === 'string') return lm.content.trim();
  if (lm.caption && typeof lm.caption === 'string') return lm.caption.trim();

  return '';
}

// Helper to format WhatsApp message timestamps safely and reliably
export function formatWhatsAppTimestamp(raw) {
  if (!raw) return 'Recent';
  if (typeof raw === 'string') {
    if (raw.toLowerCase().includes('invalid')) return 'Recent';
    if (raw === 'Recent' || raw === 'Just now' || raw.includes(':') || raw.includes('Yesterday')) {
      return raw;
    }
  }

  let ms = 0;
  if (typeof raw === 'number') {
    ms = raw < 1e12 ? raw * 1000 : raw;
  } else if (typeof raw === 'object' && raw !== null) {
    if (typeof raw.toNumber === 'function') {
      const n = raw.toNumber();
      ms = n < 1e12 ? n * 1000 : n;
    } else if (raw.low !== undefined) {
      const n = Number(raw.low);
      ms = n < 1e12 ? n * 1000 : n;
    } else if (raw instanceof Date) {
      ms = raw.getTime();
    }
  } else if (typeof raw === 'string') {
    const num = Number(raw);
    if (!isNaN(num) && num > 0) {
      ms = num < 1e12 ? num * 1000 : num;
    } else {
      const parsed = Date.parse(raw);
      if (!isNaN(parsed)) ms = parsed;
    }
  }

  if (!ms || isNaN(ms) || ms <= 0) return 'Recent';

  const date = new Date(ms);
  if (isNaN(date.getTime())) return 'Recent';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday ${timeStr}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}


// Helper to resolve the best real display name for a contact
export function resolveContactName(c, phone, isGroup) {
  if (!c) return phone ? `+${phone}` : 'WhatsApp Contact';

  if (isGroup) {
    const groupName = c.subject || c.name || c.displayName;
    if (groupName && typeof groupName === 'string' && !groupName.endsWith('@g.us')) {
      return groupName.trim();
    }
    return 'WhatsApp Group';
  }

  // Candidates in priority order
  const candidates = [
    c.notify,
    c.pushName,
    c.name,
    c.verifiedName,
    c.displayName,
    c.shortName,
    c.lastMessage?.pushName,
    c.lastMessage?.message?.pushName
  ];

  // Pass 1: Prioritize real non-phone human names
  for (const cand of candidates) {
    if (cand && typeof cand === 'string') {
      const trimmed = cand.trim();
      if (
        trimmed &&
        !trimmed.endsWith('@s.whatsapp.net') &&
        !trimmed.endsWith('@g.us') &&
        !trimmed.endsWith('@lid') &&
        !isPhoneNumber(trimmed)
      ) {
        return trimmed;
      }
    }
  }

  // Pass 2: Fallback to any defined name or phone
  for (const cand of candidates) {
    if (cand && typeof cand === 'string') {
      const trimmed = cand.trim();
      if (trimmed && !trimmed.endsWith('@s.whatsapp.net') && !trimmed.endsWith('@g.us')) {
        return trimmed.startsWith('+') ? trimmed : (isPhoneNumber(trimmed) ? `+${trimmed.replace(/\D/g, '')}` : trimmed);
      }
    }
  }

  if (phone) {
    const cleanDigits = String(phone).replace(/\D/g, '');
    return cleanDigits ? `+${cleanDigits}` : 'WhatsApp Contact';
  }

  return 'WhatsApp Contact';
}

// Helper to generate initials (never '+' sign)
export function resolveInitials(name) {
  if (!name) return 'WA';
  const trimmed = name.trim();
  if (isPhoneNumber(trimmed)) {
    const digits = trimmed.replace(/\D/g, '');
    return digits ? digits.slice(-2) : 'WA';
  }
  const clean = trimmed.replace(/[^\w\s\u0600-\u06FF\u0900-\u097F]/gi, '').trim();
  if (!clean) return 'WA';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function cleanErrorMessage(err) {
  if (!err) return 'Unknown error';
  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 503) {
    return 'CloudStation Evolution API container is sleeping (503 Service Unavailable). Using embedded WhatsApp Baileys engine.';
  }
  if (status === 502) {
    return 'Bad Gateway (502). The Evolution API container is currently starting or unresponsive.';
  }
  if (status === 404) {
    return 'Instance not found on Evolution API (404). Auto-creating instance...';
  }
  if (status === 401 || status === 403) {
    return 'Authentication failed with Evolution API. Check your EVOLUTION_API_KEY.';
  }
  if (typeof data === 'string' && data.includes('<html')) {
    return `Evolution API host returned an HTML response (${status || 'HTTP error'}). Switching to embedded WhatsApp engine.`;
  }
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
  }
  if (data?.error) {
    return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  }
  return err.message || 'Failed to communicate with Evolution API';
}

export class EvolutionService {
  constructor() {
    this.apiUrl = config.evolutionApiUrl;
    this.instance = config.evolutionInstance;
    this.apiKey = config.evolutionApiKey;
    this.isSimulated = false;
    this.simulatedConnected = false;
    this.cachedQr = null;
    this.cachedQrTime = 0;
  }

  getHeaders() {
    return {
      apikey: this.apiKey,
      'Bypass-Tunnel-Reminder': 'true'
    };
  }

  setSimulatedState(connected = true) {
    this.isSimulated = connected === true;
    this.simulatedConnected = connected === true;
    this.cachedQr = null;
    this.cachedQrTime = 0;
    return {
      isSimulated: this.isSimulated,
      state: connected ? 'open' : 'close'
    };
  }

  async createInstance(instanceName = this.instance) {
    try {
      const res = await axios.post(
        `${this.apiUrl}/instance/create`,
        {
          instanceName: instanceName || this.instance,
          token: this.apiKey,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        },
        {
          headers: this.getHeaders(),
          timeout: 10000
        }
      );
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: cleanErrorMessage(err)
      };
    }
  }

  async configureWebhook(instance = this.instance) {
    const targetInstance = instance || this.instance;
    try {
      const res = await axios.post(
        `${this.apiUrl}/webhook/set/${targetInstance}`,
        {
          webhook: {
            enabled: true,
            url: 'http://host.docker.internal:5000/api/whatappbuddy',
            byEvents: false,
            base64: false,
            events: ['MESSAGES_UPSERT']
          }
        },
        {
          headers: this.getHeaders(),
          timeout: 5000
        }
      );
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: cleanErrorMessage(err) };
    }
  }

  async getConnectionState(instance = this.instance) {
    if (this.isSimulated) {
      return {
        success: true,
        state: this.simulatedConnected ? 'open' : 'close',
        instance: instance || this.instance,
        isSimulated: true
      };
    }

    const nativeState = nativeBaileysService.getConnectionState();
    if (nativeState.state === 'open') {
      return {
        success: true,
        state: 'open',
        instance: 'native-baileys',
        number: nativeState.number
      };
    }

    const targetInstance = instance || this.instance;
    try {
      const res = await axios.get(`${this.apiUrl}/instance/connectionState/${targetInstance}`, {
        headers: this.getHeaders(),
        timeout: 3000
      });
      const owner = res.data?.instance?.owner || '';
      const cleanPhone = owner ? owner.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '') : null;
      const state = res.data?.instance?.state || 'close';

      if (state === 'open') {
        return {
          success: true,
          state: 'open',
          instance: targetInstance,
          number: cleanPhone
        };
      }
    } catch {}

    return {
      success: true,
      state: nativeState.state,
      instance: 'native-baileys',
      number: nativeState.number
    };
  }

  async getQrCode(instance = this.instance) {
    const targetInstance = instance || this.instance;

    if (this.isSimulated && this.simulatedConnected) {
      return {
        success: true,
        connectionState: 'open',
        base64: null,
        isSimulated: true
      };
    }

    try {
      const currentState = await this.getConnectionState(targetInstance);
      if (currentState.state === 'open') {
        return {
          success: true,
          connectionState: 'open',
          base64: null,
          instance: currentState.instance,
          number: currentState.number
        };
      }
    } catch {}

    const now = Date.now();
    if (this.cachedQr && (now - this.cachedQrTime) < 5000 && this.cachedQr.base64) {
      return this.cachedQr;
    }

    let externalFailed = false;
    try {
      const res = await axios.get(`${this.apiUrl}/instance/connect/${targetInstance}`, {
        headers: this.getHeaders(),
        timeout: 4000
      });

      const qrResult = {
        success: true,
        base64: res.data?.base64 || res.data?.qrcode?.base64 || null,
        code: res.data?.code || res.data?.qrcode?.code || null,
        pairingCode: res.data?.pairingCode || res.data?.qrcode?.pairingCode || null,
        count: res.data?.count || res.data?.qrcode?.count || 1,
        instance: targetInstance
      };

      if (qrResult.base64) {
        this.cachedQr = qrResult;
        this.cachedQrTime = now;
        return qrResult;
      }
      externalFailed = true;
    } catch (err) {
      externalFailed = true;
    }

    if (externalFailed) {
      try {
        const nativeQr = await nativeBaileysService.getQrCode();
        if (nativeQr.base64 || nativeQr.connectionState === 'open') {
          this.cachedQr = nativeQr;
          this.cachedQrTime = now;
          return nativeQr;
        }
      } catch (nativeErr) {
        console.error('[EvolutionService] Native Baileys QR error:', nativeErr.message);
      }
    }

    return {
      success: false,
      error: 'Initializing WhatsApp socket. Please wait a few seconds and refresh...',
      base64: null,
      instance: 'native-baileys'
    };
  }

  // Fetch real chats and contacts with accurate name and last-message resolution
  async getChats(instance = this.instance) {
    const targetInstance = instance || this.instance;

    let externalChats = [];
    try {
      const [chatsRes, contactsRes] = await Promise.allSettled([
        axios.post(
          `${this.apiUrl}/chat/findChats/${targetInstance}`,
          {},
          { headers: { apikey: this.apiKey }, timeout: 15000 }
        ),
        axios.post(
          `${this.apiUrl}/chat/findContacts/${targetInstance}`,
          {},
          { headers: { apikey: this.apiKey }, timeout: 15000 }
        )
      ]);

      const rawChats = chatsRes.status === 'fulfilled' && Array.isArray(chatsRes.value.data) ? chatsRes.value.data : [];
      const rawContacts = contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value.data) ? contactsRes.value.data : [];

      if (rawChats.length > 0 || rawContacts.length > 0) {
        const chatMap = new Map();
        const contactInfoMap = new Map();

        // 1. Index all contacts by JID to store their real names and profile pics
        for (const c of rawContacts) {
          const jid = c.remoteJid || c.id || '';
          if (jid && !jid.endsWith('@broadcast')) {
            contactInfoMap.set(jid, c);
          }
        }

        // 2. Process all chats and merge with contact info
        for (const ch of rawChats) {
          const jid = ch.remoteJid || ch.id || '';
          if (jid && !jid.endsWith('@broadcast')) {
            const matched = contactInfoMap.get(jid) || {};
            // Intelligently merge: do not let a null/phone name overwrite a real human name
            const bestName = (!isPhoneNumber(matched.name) && matched.name) ||
                             (!isPhoneNumber(matched.pushName) && matched.pushName) ||
                             (!isPhoneNumber(matched.notify) && matched.notify) ||
                             (!isPhoneNumber(ch.name) && ch.name) ||
                             (!isPhoneNumber(ch.pushName) && ch.pushName) ||
                             matched.name || ch.name;

            const merged = {
              ...matched,
              ...ch,
              name: bestName,
              pushName: matched.pushName || ch.pushName,
              notify: matched.notify || ch.notify,
              lastMessage: ch.lastMessage || matched.lastMessage
            };
            chatMap.set(jid, merged);
          }
        }

        // 3. Include any address book contacts that don't have existing chat records
        for (const [jid, c] of contactInfoMap.entries()) {
          if (!chatMap.has(jid)) {
            chatMap.set(jid, c);
          }
        }

        const colors = ['green', 'orange', 'purple', 'blue', 'pink', 'teal'];
        externalChats = Array.from(chatMap.values()).map((c, index) => {
          const jid = c.remoteJid || c.id || '';
          const isGroup = jid.endsWith('@g.us') || c.isGroup === true;
          const rawPhone = isGroup ? '' : jid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
          const displayName = resolveContactName(c, rawPhone, isGroup);
          const initials = resolveInitials(displayName);
          const lastMsgText = extractMessageText(c.lastMessage) || 'Tap to chat';

          const rawTime = c.updatedAt || c.conversationTimestamp || c.lastMessage?.messageTimestamp || c.timestamp;
          const timestamp = formatWhatsAppTimestamp(rawTime);

          return {
            id: c.id || jid,
            remoteJid: jid,
            phone: rawPhone,
            name: displayName,
            initials,
            color: colors[index % colors.length],
            isGroup,
            unread: c.unreadCount || 0,
            lastMessage: lastMsgText,
            timestamp,
            profilePicUrl: c.profilePicUrl || null
          };
        });
      }
    } catch {}

    if (externalChats.length > 0) {
      return {
        success: true,
        total: externalChats.length,
        chats: externalChats
      };
    }

    // Fallback to Native Baileys real synced contacts
    return await nativeBaileysService.getChats();
  }

  // Fetch real message history for a specific chat
  async getMessages(remoteJid, limit = 20, instance = this.instance) {
    const targetInstance = instance || this.instance;
    try {
      const res = await axios.post(
        `${this.apiUrl}/chat/findMessages/${targetInstance}`,
        {
          where: { key: { remoteJid } },
          limit
        },
        {
          headers: { apikey: this.apiKey },
          timeout: 3000
        }
      );

      const list = res.data?.messages?.records || res.data?.messages || (Array.isArray(res.data) ? res.data : []);
      if (list.length > 0) {
        const formatted = list.map((m) => {
          const fromMe = m.key?.fromMe === true;
          const text = extractMessageText(m);
          const time = m.messageTimestamp
            ? new Date(Number(m.messageTimestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent';

          return {
            id: m.key?.id || String(Math.random()),
            from: fromMe ? 'agent' : 'customer',
            sender: m.pushName || (fromMe ? 'AI Agent' : 'Customer'),
            text: text || 'Message',
            time,
            fromMe
          };
        });

        return { success: true, messages: formatted };
      }
    } catch {}

    // Fallback to Native Baileys messages
    return await nativeBaileysService.getMessages(remoteJid, limit);
  }

  // Send WhatsApp text message
  async sendTextMessage(number, text, instance = this.instance) {
    const targetInstance = instance || this.instance;
    const cleanNumber = number.includes('@') ? number : number.replace(/[^0-9]/g, '');

    const nativeState = nativeBaileysService.getConnectionState();
    if (nativeState.state === 'open') {
      return await nativeBaileysService.sendTextMessage(cleanNumber, text);
    }

    try {
      const url = `${this.apiUrl}/message/sendText/${targetInstance}`;
      const res = await axios.post(
        url,
        {
          number: cleanNumber,
          text: text.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apiKey
          },
          timeout: 10000
        }
      );
      return { success: true, data: res.data };
    } catch (err) {
      return await nativeBaileysService.sendTextMessage(cleanNumber, text);
    }
  }

  async logoutInstance(instance = this.instance) {
    const targetInstance = instance || this.instance;
    this.cachedQr = null;
    this.cachedQrTime = 0;

    await nativeBaileysService.logout().catch(() => {});

    try {
      const res = await axios.delete(`${this.apiUrl}/instance/logout/${targetInstance}`, {
        headers: { apikey: this.apiKey },
        timeout: 5000
      });
      return { success: true, data: res.data };
    } catch {
      return { success: true, data: { status: 'DISCONNECTED', instance: targetInstance } };
    }
  }
}

export const evolutionService = new EvolutionService();
