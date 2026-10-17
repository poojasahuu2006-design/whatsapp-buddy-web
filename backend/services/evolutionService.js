import axios from 'axios';

export class EvolutionService {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.EVOLUTION_API_URL || 'https://cst-evolution-api-da141464-620b10de.cloud-station.app';
    this.instance = config.instance || process.env.EVOLUTION_INSTANCE || 'cs-cst-evolution-api-da141464';
    this.apiKey = config.apiKey || process.env.EVOLUTION_API_KEY || '61C1EB49-2704-4D2C-B24B-A63A6F659F07';
  }

  // Get instance connection state ('open', 'close', 'connecting')
  async getConnectionState() {
    try {
      const res = await axios.get(`${this.apiUrl}/instance/connectionState/${this.instance}`, {
        headers: { apikey: this.apiKey },
        timeout: 6000
      });
      return {
        success: true,
        state: res.data?.instance?.state || 'close',
        instance: this.instance
      };
    } catch (err) {
      return {
        success: false,
        state: 'close',
        error: err.response?.data || err.message
      };
    }
  }

  // Fetch real QR code (base64 image, code, pairingCode)
  async getQrCode() {
    try {
      const res = await axios.get(`${this.apiUrl}/instance/connect/${this.instance}`, {
        headers: { apikey: this.apiKey },
        timeout: 10000
      });

      return {
        success: true,
        base64: res.data?.base64 || null,
        code: res.data?.code || null,
        pairingCode: res.data?.pairingCode || null,
        count: res.data?.count || 1
      };
    } catch (err) {
      console.error('Failed to get QR code from Evolution API:', err.message);
      return {
        success: false,
        error: err.response?.data || err.message
      };
    }
  }

  // Fetch real chats and contacts
  async getChats() {
    try {
      const res = await axios.post(
        `${this.apiUrl}/chat/findChats/${this.instance}`,
        {},
        {
          headers: { apikey: this.apiKey },
          timeout: 10000
        }
      );

      const rawChats = Array.isArray(res.data) ? res.data : [];

      // Filter and format individual and group chats
      const formatted = rawChats.map((c, index) => {
        const jid = c.remoteJid || '';
        const isGroup = jid.endsWith('@g.us');
        const rawPhone = isGroup ? '' : jid.replace('@s.whatsapp.net', '');
        
        // Extract display name or pushName
        let displayName = c.pushName;
        if (!displayName) {
          if (isGroup) {
            displayName = 'WhatsApp Group';
          } else if (rawPhone) {
            displayName = `+${rawPhone}`;
          } else {
            displayName = `Contact #${index + 1}`;
          }
        }

        // Extract last message text
        let lastMsg = 'No messages yet';
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

        // Initials
        const initials = (displayName || 'WA')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const colors = ['green', 'orange', 'purple', 'blue', 'pink', 'teal'];
        const color = colors[index % colors.length];

        return {
          id: c.id || jid,
          remoteJid: jid,
          phone: rawPhone,
          name: displayName,
          initials: initials || 'WA',
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
      console.error('Failed to fetch chats from Evolution API:', err.message);
      return {
        success: false,
        error: err.response?.data || err.message,
        chats: []
      };
    }
  }

  // Fetch message history for a specific chat
  async getMessages(remoteJid, limit = 20) {
    try {
      const res = await axios.post(
        `${this.apiUrl}/chat/findMessages/${this.instance}`,
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
      return { success: false, error: err.message, messages: [] };
    }
  }

  // Send WhatsApp text message
  async sendTextMessage(number, text) {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const url = `${this.apiUrl}/message/sendText/${this.instance}`;

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
      const errorMsg = err.response?.data?.response?.message || err.response?.data?.message || err.message;
      console.error(`Evolution API send error to ${cleanNumber}:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
        status: err.response?.status
      };
    }
  }
}
