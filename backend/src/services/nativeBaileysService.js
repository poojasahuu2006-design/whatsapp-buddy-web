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

export class NativeBaileysService {
  constructor() {
    this.sock = null;
    this.connectionState = 'close';
    this.qrCode = null;
    this.qrRaw = null;
    this.userNumber = null;
    this.isStarting = false;
    this.webhookHandler = null;
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

      // Listen to incoming messages for automated AI replies
      this.sock.ev.on('messages.upsert', async (m) => {
        if (!m || !m.messages || !Array.isArray(m.messages)) return;

        for (const msg of m.messages) {
          // Ignore outgoing messages sent by the bot/user
          if (!msg.key || msg.key.fromMe) continue;

          const remoteJid = msg.key.remoteJid || '';
          // Ignore status broadcasts and group messages
          if (!remoteJid || remoteJid.includes('@broadcast') || remoteJid.endsWith('@g.us')) continue;

          console.log(`[Native Baileys] Incoming message received from ${remoteJid}`);

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

  async getQrCode() {
    // If socket is not running yet, initiate it
    if (!this.sock && !this.isStarting) {
      this.start();
    }

    // Wait up to 3 seconds if QR is in the process of generating
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

  async sendTextMessage(number, text) {
    if (!this.sock || this.connectionState !== 'open') {
      return {
        success: false,
        error: 'Native WhatsApp socket is not connected. Please scan the QR code to link.'
      };
    }

    try {
      const cleanNumber = number.includes('@') ? number : `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      const result = await this.sock.sendMessage(cleanNumber, { text: text.trim() });
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

    // Immediately restart to generate fresh QR
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
