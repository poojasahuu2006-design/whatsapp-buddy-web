import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, AlertTriangle, Unplug, Trash2, Link as LinkIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('wb_live_sk_8f2a4c6e9b1d3f7a2c5e8b0d4f6a9c2e');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourapp.com/webhooks/whatsapp-buddy');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [disconnected, setDisconnected] = useState(false);

  const maskedKey = showKey ? apiKey : apiKey.replace(/./g, '•').slice(0, 28) + '...';

  const copyToClipboard = (text: string, which: 'key' | 'webhook') => {
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

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your API keys, webhooks, and account.</p>
      </div>

      {/* API Key */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink-900">API Key</h2>
          <p className="mt-1 text-sm text-ink-500">Use this key to authenticate API requests.</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3">
              <input
                type="text"
                value={maskedKey}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono text-ink-800 outline-none"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="text-ink-400 transition-colors hover:text-ink-700"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(apiKey, 'key')}
            >
              {copiedKey ? <Check className="h-4 w-4 text-whatsapp-600" /> : <Copy className="h-4 w-4" />}
              {copiedKey ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <Button variant="outline" size="sm" className="mt-3" onClick={() => setApiKey('wb_live_sk_' + Math.random().toString(36).slice(2, 18))}>
            Regenerate Key
          </Button>
        </Card>
      </motion.div>

      {/* Webhook URL */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink-900">Webhook URL</h2>
          <p className="mt-1 text-sm text-ink-500">We'll send event notifications to this endpoint.</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3">
              <LinkIcon className="h-4 w-4 flex-shrink-0 text-ink-400" />
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-transparent text-sm text-ink-800 outline-none"
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
