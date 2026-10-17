import axios from 'axios';
import { config } from '../config/config.js';

// Helper to clean and humanize error responses from Evolution API / CloudStation
function cleanErrorMessage(err) {
  if (!err) return 'Unknown error';
  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 503) {
    return 'CloudStation Evolution API container is sleeping or offline (503 Service Unavailable). Please log in to https://app.cloud-station.io to wake or restart the service.';
  }
  if (status === 502) {
    return 'Bad Gateway (502). The Evolution API container is currently starting or unresponsive.';
  }
  if (status === 404) {
    return 'Instance not found on Evolution API (404). You can create the instance using /api/create-instance.';
  }
  if (status === 401 || status === 403) {
    return 'Authentication failed with Evolution API. Check your EVOLUTION_API_KEY.';
  }
  if (typeof data === 'string' && data.includes('<html')) {
    return `Evolution API host returned an HTML response (${status || 'HTTP error'}). The container might be restarting or paused on CloudStation.`;
  }
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
  }
  if (data?.error) {
    return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  }
  return err.message || 'Failed to communicate with Evolution API';
}

// Generate demo QR code SVG data URI when Evolution API is unavailable or offline
function generateFallbackQrSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="240" height="240">
    <rect width="256" height="256" fill="#FFFFFF" rx="16"/>
    <rect x="24" y="24" width="64" height="64" fill="#111B21" rx="8"/>
    <rect x="36" y="36" width="40" height="40" fill="#FFFFFF" rx="4"/>
    <rect x="44" y="44" width="24" height="24" fill="#25D366" rx="2"/>

    <rect x="168" y="24" width="64" height="64" fill="#111B21" rx="8"/>
    <rect x="180" y="36" width="40" height="40" fill="#FFFFFF" rx="4"/>
    <rect x="188" y="44" width="24" height="24" fill="#25D366" rx="2"/>

    <rect x="24" y="168" width="64" height="64" fill="#111B21" rx="8"/>
    <rect x="36" y="180" width="40" height="40" fill="#FFFFFF" rx="4"/>
    <rect x="44" y="188" width="24" height="24" fill="#25D366" rx="2"/>

    <rect x="104" y="28" width="16" height="16" fill="#111B21"/>
    <rect x="128" y="28" width="16" height="16" fill="#111B21"/>
    <rect x="104" y="52" width="16" height="16" fill="#111B21"/>
    <rect x="136" y="68" width="16" height="16" fill="#111B21"/>
    <rect x="28" y="104" width="16" height="16" fill="#111B21"/>
    <rect x="52" y="104" width="16" height="16" fill="#111B21"/>
    <rect x="76" y="104" width="16" height="16" fill="#111B21"/>
    <rect x="104" y="104" width="48" height="48" fill="#128C7E" rx="8"/>
    <circle cx="128" cy="128" r="14" fill="#25D366"/>
    <rect x="168" y="104" width="16" height="16" fill="#111B21"/>
    <rect x="200" y="104" width="16" height="16" fill="#111B21"/>
    <rect x="168" y="128" width="32" height="16" fill="#111B21"/>
    <rect x="216" y="136" width="16" height="32" fill="#111B21"/>
    <rect x="104" y="168" width="16" height="24" fill="#111B21"/>
    <rect x="136" y="168" width="16" height="16" fill="#111B21"/>
    <rect x="104" y="208" width="32" height="16" fill="#111B21"/>
    <rect x="168" y="184" width="16" height="16" fill="#111B21"/>
    <rect x="200" y="184" width="16" height="16" fill="#111B21"/>
    <rect x="184" y="208" width="32" height="16" fill="#111B21"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export class EvolutionService {
  constructor() {
    this.apiUrl = config.evolutionApiUrl;
    this.instance = config.evolutionInstance;
    this.apiKey = config.evolutionApiKey;
    this.isSimulated = false;
    this.simulatedConnected = false;
  }

  // Simulation controls for testing/demo when CloudStation is offline
  setSimulatedState(connected = true) {
    this.isSimulated = true;
    this.simulatedConnected = connected;
    return {
      isSimulated: this.isSimulated,
      state: connected ? 'open' : 'close'
    };
  }

  // Create an instance in Evolution API
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
          headers: { apikey: this.apiKey },
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

  // Cache QR code to prevent spamming /instance/connect and causing Baileys disconnects
  cachedQr = null;
  cachedQrTime = 0;

  // Configure Evolution API webhook for real-time incoming messages
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
          headers: { apikey: this.apiKey },
          timeout: 10000
        }
      );
      console.log(`[EvolutionService] Webhook configured for ${targetInstance} -> http://host.docker.internal:5000/api/whatappbuddy`);
      return { success: true, data: res.data };
    } catch (err) {
      console.warn(`[EvolutionService] Failed to set webhook for ${targetInstance}:`, cleanErrorMessage(err));
      return { success: false, error: cleanErrorMessage(err) };
    }
  }

  // Get instance connection state ('open', 'close', 'connecting')
  async getConnectionState(instance = this.instance) {
    if (this.isSimulated) {
      return {
        success: true,
        state: this.simulatedConnected ? 'open' : 'close',
        instance: instance || this.instance,
        isSimulated: true
      };
    }

    const targetInstance = instance || this.instance;
    try {
      const res = await axios.get(`${this.apiUrl}/instance/connectionState/${targetInstance}`, {
        headers: { apikey: this.apiKey },
        timeout: 6000
      });
      const owner = res.data?.instance?.owner || '';
      const cleanPhone = owner ? owner.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '') : null;
      const state = res.data?.instance?.state || 'close';

      return {
        success: true,
        state,
        instance: targetInstance,
        number: cleanPhone
      };
    } catch (err) {
      return {
        success: false,
        state: 'close',
        instance: targetInstance,
        number: null,
        error: cleanErrorMessage(err)
      };
    }
  }

  // Fetch real QR code (base64 image, code, pairingCode)
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

    // Guard: If WhatsApp is already connected, NEVER request a new QR code as that resets the Baileys session!
    try {
      const currentState = await this.getConnectionState(targetInstance);
      if (currentState.state === 'open') {
        return {
          success: true,
          connectionState: 'open',
          base64: null,
          instance: targetInstance,
          number: currentState.number
        };
      }
    } catch {
      // ignore check error and proceed
    }

    // Cache QR code for 10 seconds to avoid flooding the /instance/connect endpoint on frequent polling
    const now = Date.now();
    if (this.cachedQr && (now - this.cachedQrTime) < 10000) {
      return this.cachedQr;
    }

    try {
      const res = await axios.get(`${this.apiUrl}/instance/connect/${targetInstance}`, {
        headers: { apikey: this.apiKey },
        timeout: 10000
      });

      const qrResult = {
        success: true,
        base64: res.data?.base64 || res.data?.qrcode?.base64 || null,
        code: res.data?.code || res.data?.qrcode?.code || null,
        pairingCode: res.data?.pairingCode || res.data?.qrcode?.pairingCode || null,
        count: res.data?.count || res.data?.qrcode?.count || 1,
        instance: targetInstance
      };

      this.cachedQr = qrResult;
      this.cachedQrTime = now;

      return qrResult;
    } catch (err) {
      const cleanError = cleanErrorMessage(err);
      console.warn(`[EvolutionService] Failed to get QR for ${targetInstance}:`, cleanError);
      return {
        success: false,
        error: cleanError,
        isOffline: true,
        fallbackQr: generateFallbackQrSvg(),
        instance: targetInstance
      };
    }
  }

  // Fetch real chats and contacts
  async getChats(instance = this.instance) {
    const targetInstance = instance || this.instance;

    if (this.isSimulated && this.simulatedConnected) {
      return {
        success: true,
        total: 5,
        chats: [
          {
            id: '919876543210@s.whatsapp.net',
            remoteJid: '919876543210@s.whatsapp.net',
            phone: '919876543210',
            name: 'Aarav Patel',
            initials: 'AP',
            color: 'green',
            isGroup: false,
            unread: 1,
            lastMessage: 'Can I schedule a consultation call tomorrow at 4 PM?',
            timestamp: '2 min ago'
          },
          {
            id: '919876543211@s.whatsapp.net',
            remoteJid: '919876543211@s.whatsapp.net',
            phone: '919876543211',
            name: 'Sara Khan',
            initials: 'SK',
            color: 'purple',
            isGroup: false,
            unread: 0,
            lastMessage: 'What services does Nexus agency provide?',
            timestamp: '14 min ago'
          },
          {
            id: '919876543212@s.whatsapp.net',
            remoteJid: '919876543212@s.whatsapp.net',
            phone: '919876543212',
            name: 'Rohan Mehta',
            initials: 'RM',
            color: 'blue',
            isGroup: false,
            unread: 0,
            lastMessage: 'Thanks! The Google Calendar invite just popped up on my phone.',
            timestamp: '45 min ago'
          }
        ]
      };
    }

    try {
      // Query both active chats and address book contacts from Evolution API
      const [chatsRes, contactsRes] = await Promise.allSettled([
        axios.post(
          `${this.apiUrl}/chat/findChats/${targetInstance}`,
          {},
          { headers: { apikey: this.apiKey }, timeout: 10000 }
        ),
        axios.post(
          `${this.apiUrl}/chat/findContacts/${targetInstance}`,
          {},
          { headers: { apikey: this.apiKey }, timeout: 10000 }
        )
      ]);

      const rawChats = chatsRes.status === 'fulfilled' && Array.isArray(chatsRes.value.data) ? chatsRes.value.data : [];
      const rawContacts = contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value.data) ? contactsRes.value.data : [];

      // Map to merge contacts and deduplicate by remoteJid
      const chatMap = new Map();

      // Process chats first (with last messages if any)
      for (const c of rawChats) {
        const jid = c.remoteJid || c.id || '';
        if (jid && !jid.endsWith('@broadcast') && !jid.endsWith('@lid')) {
          chatMap.set(jid, c);
        }
      }

      // Merge synced phone contacts
      for (const c of rawContacts) {
        const jid = c.remoteJid || c.id || '';
        if (jid && !jid.endsWith('@broadcast') && !jid.endsWith('@lid')) {
          if (!chatMap.has(jid)) {
            chatMap.set(jid, c);
          } else {
            const existing = chatMap.get(jid);
            if (!existing.pushName && c.pushName) existing.pushName = c.pushName;
            if (!existing.profilePicUrl && c.profilePicUrl) existing.profilePicUrl = c.profilePicUrl;
          }
        }
      }

      const mergedList = Array.from(chatMap.values());
      const colors = ['green', 'orange', 'purple', 'blue', 'pink', 'teal'];

      const formatted = mergedList.map((c, index) => {
        const jid = c.remoteJid || c.id || '';
        const isGroup = jid.endsWith('@g.us') || c.isGroup === true;
        const rawPhone = isGroup ? '' : jid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
        
        let displayName = c.pushName || c.name || c.verifiedName;
        if (!displayName) {
          if (isGroup) {
            displayName = 'WhatsApp Group';
          } else if (rawPhone) {
            displayName = `+${rawPhone}`;
          } else {
            displayName = `Contact #${index + 1}`;
          }
        }

        let lastMsg = 'Synced from WhatsApp';
        const lm = c.lastMessage;
        if (lm) {
          if (typeof lm.message === 'string') {
            lastMsg = lm.message;
          } else if (lm.message?.conversation) {
            lastMsg = lm.message.conversation;
          } else if (lm.message?.extendedTextMessage?.text) {
            lastMsg = lm.message.extendedTextMessage.text;
          } else if (lm.pushName && lm.messageType) {
            lastMsg = `[${lm.messageType}]`;
          }
        }

        const initials = (displayName || 'WA')
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'WA';

        const color = colors[index % colors.length];

        return {
          id: c.id || jid,
          remoteJid: jid,
          phone: rawPhone,
          name: displayName,
          initials,
          color,
          isGroup,
          unread: c.unreadCount || 0,
          lastMessage: lastMsg,
          timestamp: c.updatedAt
            ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
          profilePicUrl: c.profilePicUrl || null
        };
      });

      return {
        success: true,
        total: formatted.length,
        chats: formatted
      };
    } catch (err) {
      const cleanError = cleanErrorMessage(err);
      console.warn(`[EvolutionService] Failed to fetch chats for ${targetInstance}:`, cleanError);
      return {
        success: false,
        error: cleanError,
        chats: []
      };
    }
  }

  // Fetch message history for a specific chat
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
          timeout: 10000
        }
      );

      const list = res.data?.messages || (Array.isArray(res.data) ? res.data : []);
      const formatted = list.map((m) => {
        const fromMe = m.key?.fromMe === true;
        let text = '';
        if (m.message?.conversation) text = m.message.conversation;
        else if (m.message?.extendedTextMessage?.text) text = m.message.extendedTextMessage.text;
        else if (typeof m.message === 'string') text = m.message;
        else text = `[${m.messageType || 'Message'}]`;

        const time = m.messageTimestamp
          ? new Date(m.messageTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now';

        return {
          id: m.key?.id || String(Math.random()),
          from: fromMe ? 'agent' : 'customer',
          sender: m.pushName || (fromMe ? 'AI Agent' : 'Customer'),
          text,
          time,
          fromMe
        };
      });

      return { success: true, messages: formatted };
    } catch (err) {
      return { success: false, error: cleanErrorMessage(err), messages: [] };
    }
  }

  // Send WhatsApp text message
  async sendTextMessage(number, text, instance = this.instance) {
    const targetInstance = instance || this.instance;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const url = `${this.apiUrl}/message/sendText/${targetInstance}`;

    if (this.isSimulated && this.simulatedConnected) {
      return {
        success: true,
        data: {
          key: { remoteJid: `${cleanNumber}@s.whatsapp.net`, fromMe: true },
          message: { conversation: text }
        },
        isSimulated: true
      };
    }

    try {
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
      return {
        success: false,
        error: cleanErrorMessage(err),
        status: err.response?.status
      };
    }
  }

  // Logout/Disconnect WhatsApp instance from Evolution API
  async logoutInstance(instance = this.instance) {
    const targetInstance = instance || this.instance;
    if (this.isSimulated) {
      this.simulatedConnected = false;
      return { success: true, data: { status: 'DISCONNECTED', instance: targetInstance } };
    }

    this.cachedQr = null;
    this.cachedQrTime = 0;

    try {
      const res = await axios.delete(`${this.apiUrl}/instance/logout/${targetInstance}`, {
        headers: { apikey: this.apiKey },
        timeout: 10000
      });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: cleanErrorMessage(err) };
    }
  }
}

export const evolutionService = new EvolutionService();
