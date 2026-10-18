import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.resolve(__dirname, '../../../backend/baileys_auth_info');
const CONTACTS_CACHE_FILE = path.join(AUTH_DIR, 'synced_contacts.json');

export class NativeBaileysService {
  constructor() {
    this.sock = null;
    this.connectionState = 'close';
    this.qrCode = null;
    this.qrRaw = null;
    this.userNumber = null;
    this.isStarting = false;
    this.webhookHandler = null;
    this.contactsMap = new Map();
    this.chatsMap = new Map();
    this.messagesMap = new Map();

    this.loadCachedContacts();
  }

  loadCachedContacts() {
    try {
      if (fs.existsSync(CONTACTS_CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CONTACTS_CACHE_FILE, 'utf-8'));
        if (Array.isArray(data)) {
          for (const c of data) {
            if (c.remoteJid) {
              this.chatsMap.set(c.remoteJid, c);
            }
          }
        }
      }
    } catch {}
  }

  saveCachedContacts() {
    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }
      const list = Array.from(this.chatsMap.values());
      fs.writeFileSync(CONTACTS_CACHE_FILE, JSON.stringify(list, null, 2));
    } catch {}
  }

  setWebhookHandler(handler) {
    this.webhookHandler = handler;
  }

  async start() {
    if (this.isStarting || (this.sock && this.connectionState === 'open')) {
      return;
    }

    this.isStarting = true;

    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1043857760] }));

      console.log(`[Native Baileys] Initializing embedded WhatsApp socket (Baileys v${version.join('.')})...`);

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['WhatsApp Buddy', 'Chrome', '124.0.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qrRaw = qr;
            this.qrCode = await QRCode.toDataURL(qr);
            this.connectionState = 'connecting';
            console.log('[Native Baileys] New live WhatsApp QR Code generated ready for scan');
          } catch (qrErr) {
            console.error('[Native Baileys] Error converting QR to base64:', qrErr.message);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          this.connectionState = 'close';
          this.isStarting = false;

          console.log(`[Native Baileys] Connection closed. Reason: ${lastDisconnect?.error?.message || statusCode}. Reconnect: ${shouldReconnect}`);

          if (shouldReconnect) {
            setTimeout(() => this.start(), 3000);
          } else {
            console.log('[Native Baileys] Logged out. Resetting session credentials...');
            this.resetSession();
            setTimeout(() => this.start(), 1500);
          }
        } else if (connection === 'open') {
          this.connectionState = 'open';
          this.qrCode = null;
          this.qrRaw = null;
          this.isStarting = false;

          const rawId = this.sock?.user?.id || '';
          this.userNumber = rawId ? rawId.split(':')[0].replace(/[^0-9]/g, '') : 'WhatsApp User';
          console.log(`\n======================================================`);
          console.log(`🎉 [Native Baileys] WhatsApp Account Linked Successfully!`);
          console.log(`📱 Connected Phone: +${this.userNumber}`);
          console.log(`======================================================\n`);
        }
      });

      // Synchronize Contacts from WhatsApp
      this.sock.ev.on('contacts.upsert', (newContacts) => {
        if (!Array.isArray(newContacts)) return;
        for (const c of newContacts) {
          if (c.id) {
            this.contactsMap.set(c.id, { ...this.contactsMap.get(c.id), ...c });
          }
        }
        this.syncToChatsMap();
      });

      this.sock.ev.on('contacts.update', (updatedContacts) => {
        if (!Array.isArray(updatedContacts)) return;
        for (const c of updatedContacts) {
          if (c.id) {
            this.contactsMap.set(c.id, { ...this.contactsMap.get(c.id), ...c });
          }
        }
        this.syncToChatsMap();
      });

      // Synchronize Chats & History from WhatsApp
      this.sock.ev.on('chats.upsert', (newChats) => {
        if (!Array.isArray(newChats)) return;
        for (const ch of newChats) {
          if (ch.id) {
            this.chatsMap.set(ch.id, { ...this.chatsMap.get(ch.id), ...ch });
          }
        }
        this.saveCachedContacts();
      });

      this.sock.ev.on('messaging-history.set', ({ contacts, chats }) => {
        if (Array.isArray(contacts)) {
          for (const c of contacts) {
            if (c.id) this.contactsMap.set(c.id, c);
          }
        }
        if (Array.isArray(chats)) {
          for (const ch of chats) {
            if (ch.id) this.chatsMap.set(ch.id, ch);
          }
        }
        this.syncToChatsMap();
        this.saveCachedContacts();
        console.log(`[Native Baileys] Synced real history from phone: ${this.contactsMap.size} contacts, ${this.chatsMap.size} chats`);
      });

      // Listen to incoming messages for automated AI replies and message history
      this.sock.ev.on('messages.upsert', async (m) => {
        if (!m || !m.messages || !Array.isArray(m.messages)) return;

        for (const msg of m.messages) {
          const remoteJid = msg.key?.remoteJid || '';
          if (!remoteJid || remoteJid.includes('@broadcast')) continue;

          // Record in messagesMap
          const list = this.messagesMap.get(remoteJid) || [];
          const text = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            (msg.message?.imageMessage ? '[Image]' : '') ||
            (msg.message?.videoMessage ? '[Video]' : '') ||
            '';

          const formattedMsg = {
            id: msg.key?.id || String(Date.now()),
            from: msg.key?.fromMe ? 'agent' : 'customer',
            sender: msg.pushName || (msg.key?.fromMe ? 'You' : 'Customer'),
            text,
            time: 'Just now',
            fromMe: !!msg.key?.fromMe
          };

          list.push(formattedMsg);
          this.messagesMap.set(remoteJid, list);

          // Update latest chat preview
          const existing = this.chatsMap.get(remoteJid) || {};
          const isGroup = remoteJid.endsWith('@g.us');
          const cleanPhone = isGroup ? '' : remoteJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
          const name = msg.pushName || existing.name || (cleanPhone ? `+${cleanPhone}` : 'WhatsApp Chat');

          this.chatsMap.set(remoteJid, {
            ...existing,
            id: remoteJid,
            remoteJid,
            phone: cleanPhone,
            name,
            lastMessage: text || existing.lastMessage || 'Recent message',
            timestamp: 'Just now',
            isGroup,
            unread: msg.key?.fromMe ? 0 : 1
          });
          this.saveCachedContacts();

          // Ignore outgoing messages sent by the bot/user for webhook triggers
          if (msg.key?.fromMe) continue;
          if (remoteJid.endsWith('@g.us')) continue;

          console.log(`[Native Baileys] Incoming message received from ${remoteJid}: "${text}"`);

          if (typeof this.webhookHandler === 'function') {
            try {
              await this.webhookHandler(msg);
            } catch (err) {
              console.error('[Native Baileys] Error in incoming message handler:', err.message);
            }
          }
        }
      });

      this.isStarting = false;
    } catch (err) {
      console.error('[Native Baileys] Startup error:', err.message);
      this.isStarting = false;
    }
  }

  syncToChatsMap() {
    const colors = ['green', 'orange', 'purple', 'blue', 'pink', 'teal'];
    let idx = 0;

    for (const [id, c] of this.contactsMap.entries()) {
      if (!id || id.includes('@broadcast') || id.includes('@lid')) continue;
      const isGroup = id.endsWith('@g.us');
      const cleanPhone = isGroup ? '' : id.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
      const displayName = c.name || c.notify || c.verifiedName || (cleanPhone ? `+${cleanPhone}` : 'Contact');
      
      const initials = (displayName || 'WA')
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'WA';

      const existing = this.chatsMap.get(id);
      this.chatsMap.set(id, {
        id,
        remoteJid: id,
        phone: cleanPhone,
        name: displayName,
        initials,
        color: existing?.color || colors[idx % colors.length],
        isGroup,
        unread: existing?.unread || 0,
        lastMessage: existing?.lastMessage || 'Synced from WhatsApp',
        timestamp: existing?.timestamp || 'Synced',
        profilePicUrl: c.imgUrl || null
      });
      idx++;
    }
  }

  async getQrCode() {
    if (!this.sock && !this.isStarting) {
      this.start();
    }

    if (!this.qrCode && this.connectionState !== 'open') {
      for (let i = 0; i < 15; i++) {
        if (this.qrCode || this.connectionState === 'open') break;
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (this.connectionState === 'open') {
      return {
        success: true,
        connectionState: 'open',
        base64: null,
        number: this.userNumber,
        instance: 'native-baileys'
      };
    }

    if (this.qrCode) {
      return {
        success: true,
        base64: this.qrCode,
        code: this.qrRaw,
        instance: 'native-baileys',
        connectionState: 'connecting'
      };
    }

    return {
      success: false,
      base64: null,
      error: 'WhatsApp Baileys socket is initializing. Please wait a moment...',
      instance: 'native-baileys'
    };
  }

  getConnectionState() {
    return {
      success: true,
      state: this.connectionState,
      instance: 'native-baileys',
      number: this.userNumber
    };
  }

  // Get active contacts & chats synced from real WhatsApp
  async getChats() {
    const syncedList = Array.from(this.chatsMap.values());
    const colors = ['green', 'orange', 'purple', 'blue', 'pink', 'teal'];

    const formattedSynced = syncedList
      .filter((c) => c && (c.name || c.phone || c.remoteJid))
      .map((c, i) => {
        const isGroup = !!c.isGroup || (c.remoteJid && c.remoteJid.endsWith('@g.us'));
        const cleanPhone = isGroup ? '' : (c.phone || (c.remoteJid ? c.remoteJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '') : ''));
        const name = c.name || (cleanPhone ? `+${cleanPhone}` : (isGroup ? 'WhatsApp Group' : 'Contact'));

        const initials = (name || 'WA')
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'WA';

        return {
          id: c.id || c.remoteJid,
          remoteJid: c.remoteJid || c.id,
          phone: cleanPhone,
          name,
          initials,
          color: c.color || colors[i % colors.length],
          isGroup,
          unread: c.unread || 0,
          lastMessage: c.lastMessage || 'Synced from WhatsApp',
          timestamp: c.timestamp || 'Recent',
          profilePicUrl: c.profilePicUrl || null
        };
      });

    return {
      success: true,
      total: formattedSynced.length,
      chats: formattedSynced
    };
  }

  // Get real message history for a chat
  async getMessages(remoteJid, limit = 20) {
    if (this.messagesMap.has(remoteJid)) {
      const msgs = this.messagesMap.get(remoteJid) || [];
      return {
        success: true,
        messages: msgs.slice(-limit)
      };
    }

    return {
      success: true,
      messages: []
    };
  }

  async sendTextMessage(number, text) {
    const cleanNumber = number.includes('@') ? number : `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

    if (!this.sock || this.connectionState !== 'open') {
      return {
        success: false,
        error: 'WhatsApp socket is not connected. Please scan the QR code to connect.'
      };
    }

    try {
      const result = await this.sock.sendMessage(cleanNumber, { text: text.trim() });
      
      // Record outgoing message
      const list = this.messagesMap.get(cleanNumber) || [];
      list.push({
        id: result?.key?.id || String(Date.now()),
        from: 'agent',
        sender: 'You',
        text: text.trim(),
        time: 'Just now',
        fromMe: true
      });
      this.messagesMap.set(cleanNumber, list);

      return {
        success: true,
        data: result
      };
    } catch (err) {
      console.error('[Native Baileys] Failed to send text message:', err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  async logout() {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
      }
    } catch {}

    this.resetSession();
    this.connectionState = 'close';
    this.qrCode = null;
    this.qrRaw = null;
    this.userNumber = null;
    this.contactsMap.clear();
    this.chatsMap.clear();
    this.messagesMap.clear();

    setTimeout(() => this.start(), 1000);

    return { success: true, message: 'Logged out successfully' };
  }

  resetSession() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('[Native Baileys] Could not clear auth dir:', err.message);
    }
  }
}

export const nativeBaileysService = new NativeBaileysService();
