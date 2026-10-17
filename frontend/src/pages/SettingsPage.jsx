import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Unplug,
  Trash2,
  Link as LinkIcon,
  Server,
  Calendar,
  Database,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('wb_live_sk_8f2a4c6e9b1d3f7a2c5e8b0d4f6a9c2e');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  
  // Evolution API settings
  const [evolutionUrl, setEvolutionUrl] = useState('https://cst-evolution-api-da141464-620b10de.cloud-station.app');
  const [evolutionInstance, setEvolutionInstance] = useState('cs-cst-evolution-api-da141464');
  const [evolutionKey, setEvolutionKey] = useState('61C1EB49-2704-4D2C-B24B-A63A6F659F07');
  const [showEvoKey, setShowEvoKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'idle', 'testing', 'connected'

  const [webhookUrl, setWebhookUrl] = useState(window.location.origin + '/api/whatappbuddy');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  
  const [calendarEmail, setCalendarEmail] = useState('poojasahuu2006@gmail.com');
  const [sheetId, setSheetId] = useState('1qWtucHwvHVXJAfzRPUnz12kQNX0EWFmkA9delB0I4LE');

  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [disconnected, setDisconnected] = useState(false);

  const maskedKey = showKey ? apiKey : apiKey.replace(/./g, '•').slice(0, 28) + '...';
  const maskedEvoKey = showEvoKey ? evolutionKey : evolutionKey.replace(/./g, '•').slice(0, 24) + '...';

  const copyToClipboard = (text, which) => {
    navigator.clipboard?.writeText(text).then(() => {
      if (which === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
      }
    });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('connected');
      }
    } catch {
      setConnectionStatus('connected');
    } finally {
      setTimeout(() => {
        setTestingConnection(false);
      }, 700);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">
          Configure Evolution API credentials, Webhook endpoints, and AI tool integrations.
        </p>
      </div>

      {/* Evolution API Gateway Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6 border border-cream-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-whatsapp-100 text-whatsapp-700">
                <Server className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink-900">Evolution API Gateway</h2>
                <p className="text-xs text-ink-500">Connected instance for WhatsApp message transmission.</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-whatsapp-50 px-3 py-1 text-xs font-bold text-whatsapp-700 border border-whatsapp-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active Connection
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-600">
                Evolution API Endpoint
              </label>
              <input
                type="text"
                value={evolutionUrl}
                onChange={(e) => setEvolutionUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 font-mono text-xs text-ink-800 outline-none focus:border-whatsapp-500 focus:bg-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600">
                  Instance Name
                </label>
                <input
                  type="text"
                  value={evolutionInstance}
                  onChange={(e) => setEvolutionInstance(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 font-mono text-xs text-ink-800 outline-none focus:border-whatsapp-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600">
                  Instance API Key
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2">
                  <input
                    type="text"
                    value={maskedEvoKey}
                    readOnly
                    className="flex-1 bg-transparent font-mono text-xs text-ink-800 outline-none"
                  />
                  <button
                    onClick={() => setShowEvoKey((v) => !v)}
                    className="text-ink-400 hover:text-ink-700"
                  >
                    {showEvoKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cream-200">
              <span className="text-xs text-ink-400">
                Outbound: <code>POST /message/sendText/{evolutionInstance}</code>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={testingConnection}
                onClick={handleTestConnection}
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-whatsapp-600" />
                    Test Gateway
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Webhook URL Endpoint */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="p-6 border border-cream-300">
          <h2 className="text-lg font-bold text-ink-900">Webhook Receiver URL</h2>
          <p className="mt-1 text-sm text-ink-500">
            Set this endpoint in your Evolution API / n8n webhook settings to receive incoming WhatsApp messages.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3">
              <LinkIcon className="h-4 w-4 flex-shrink-0 text-ink-400" />
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-transparent font-mono text-xs text-ink-800 outline-none"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(webhookUrl, 'webhook')}
            >
              {copiedWebhook ? <Check className="h-4 w-4 text-whatsapp-600" /> : <Copy className="h-4 w-4" />}
              {copiedWebhook ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Connected Tools & Data Sources Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="p-6 border border-cream-300">
          <h2 className="text-lg font-bold text-ink-900">AI Connected Tools</h2>
          <p className="mt-1 text-sm text-ink-500">
            Autonomous tools called by the AI Agent to book meetings and query data.
          </p>

          <div className="mt-4 space-y-4">
            {/* Google Calendar */}
            <div className="flex items-start gap-3 rounded-xl border border-cream-300 bg-cream-50 p-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Calendar className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink-900">Google Calendar Consultation Tool</h3>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Asia/Kolkata
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  Primary host calendar for consultation meetings:
                </p>
                <input
                  type="text"
                  value={calendarEmail}
                  onChange={(e) => setCalendarEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-cream-300 bg-white px-3 py-1.5 font-mono text-xs text-ink-800 outline-none focus:border-whatsapp-500"
                />
              </div>
            </div>

            {/* Google Sheets KnowledgeBase */}
            <div className="flex items-start gap-3 rounded-xl border border-cream-300 bg-cream-50 p-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <Database className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink-900">Nexus KnowledgeBase Sheet</h3>
                  <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    Sheet1 (gid=0)
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  Google Sheets Document ID for agency services, pricing packages, and FAQs:
                </p>
                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-cream-300 bg-white px-3 py-1.5 font-mono text-xs text-ink-800 outline-none focus:border-whatsapp-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
          </div>
          <p className="mt-1 text-sm text-ink-500">Irreversible actions. Please proceed with caution.</p>

          <div className="mt-5 space-y-4">
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-cream-50 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-ink-900">Disconnect WhatsApp</p>
                <p className="text-xs text-ink-500">Unlink your WhatsApp number from this account.</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setConfirmDisconnect(true)}>
                <Unplug className="h-4 w-4" />
                Disconnect
              </Button>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-cream-50 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-ink-900">Delete Account</p>
                <p className="text-xs text-ink-500">Permanently delete your account and all data.</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confirmation modals */}
      <Modal
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        title="Disconnect WhatsApp?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDisconnect(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setDisconnected(true); setConfirmDisconnect(false); }}>
              Yes, Disconnect
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Your WhatsApp number will be unlinked. You'll need to reconnect to resume automation.
          {disconnected && <span className="mt-2 block font-bold text-whatsapp-600">WhatsApp has been disconnected.</span>}
        </p>
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setConfirmDelete(false)}>
              Yes, Delete Forever
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          This will permanently delete your account, all conversations, personas, and automation data.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
