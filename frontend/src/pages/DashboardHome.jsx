import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Inbox,
  QrCode,
  Search,
  Send,
  Sparkles,
  Bot,
  CheckCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Unplug,
  ShieldCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Sparkline from '@/components/ui/Sparkline';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { stats } from '@/data/mockData';

export default function DashboardHome() {
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'individual', 'groups'

  // Connection State with Evolution API ('open', 'close', 'connecting')
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [dashboardQr, setDashboardQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrTimer, setQrTimer] = useState(25);

  // Selected chat for conversation drawer/modal
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  // Check connection state and fetch contacts if open or synced
  const checkConnectionAndContacts = async () => {
    try {
      const stateRes = await fetch('/api/connection-state');
      let currentState = 'close';
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        currentState = stateData.state || 'close';
        setConnectionStatus(currentState);
      }

      // Fetch real contacts from WhatsApp sync
      const cRes = await fetch('/api/contacts');
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.chats && cData.chats.length > 0) {
          setContacts(cData.chats);
        } else {
          setContacts([]);
          if (currentState !== 'open') fetchDashboardQr();
        }
      } else if (currentState !== 'open') {
        fetchDashboardQr();
      }
    } catch (err) {
      console.error('Connection check error:', err);
      setConnectionStatus('close');
    } finally {
      setLoadingContacts(false);
      setStatsLoading(false);
    }
  };

  // Fetch live QR code for linking
  const fetchDashboardQr = async () => {
    setQrLoading(true);
    try {
      const res = await fetch('/api/qr');
      if (res.ok) {
        const data = await res.json();
        if (data.connectionState === 'open') {
          setConnectionStatus('open');
        } else if (data.base64) {
          setDashboardQr(data.base64);
          setQrTimer(25);
        } else if (data.fallbackQr) {
          setDashboardQr(data.fallbackQr);
          setQrTimer(25);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard QR:', err);
    } finally {
      setQrLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    checkConnectionAndContacts();
  }, []);

  // Poll connection state every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const stateRes = await fetch('/api/connection-state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          const currentState = stateData.state || 'close';
          
          if (currentState !== connectionStatus) {
            setConnectionStatus(currentState);
            if (currentState === 'open' || contacts.length === 0) {
              const cRes = await fetch('/api/contacts');
              if (cRes.ok) {
                const cData = await cRes.json();
                if (cData.chats && cData.chats.length > 0) {
                  setContacts(cData.chats);
                }
              }
            } else if (currentState !== 'open' && contacts.length === 0) {
              fetchDashboardQr();
            }
          }
        }
      } catch {
        // network polling error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // QR refresh timer when not connected
  useEffect(() => {
    if (connectionStatus === 'open') return;

    const timer = setInterval(() => {
      setQrTimer((prev) => {
        if (prev <= 1) {
          fetchDashboardQr();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [connectionStatus]);

  // Disconnect WhatsApp session
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp? You will need to scan QR again.')) return;
    try {
      await fetch('/api/disconnect', { method: 'POST' });
      setConnectionStatus('close');
      setContacts([]);
      setSelectedContact(null);
      fetchDashboardQr();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Open Chat Conversation
  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setLoadingMessages(true);
    setAiNotice(null);

    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(contact.remoteJid)}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          setLoadingMessages(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Default conversational context if message history endpoint has no prior rows
    const defaultList = [
      {
        id: 'm1',
        from: 'customer',
        sender: contact.name,
        text: contact.lastMessage && contact.lastMessage !== 'No messages yet'
          ? contact.lastMessage
          : 'Hi! Can you share details about your services and pricing?',
        time: 'Just now',
        fromMe: false,
      },
    ];

    setMessages(defaultList);
    setLoadingMessages(false);
  };

  // Send Direct Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !selectedContact) return;

    const textToSend = messageInput.trim();
    const phone = selectedContact.phone || selectedContact.remoteJid?.replace('@s.whatsapp.net', '') || '';

    const newMsg = {
      id: 'msg-' + Date.now(),
      from: 'agent',
      sender: 'You',
      text: textToSend,
      time: 'Just now',
      fromMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    setSendingMessage(true);

    try {
      await fetch('/api/chats/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: phone, text: textToSend }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Generate & Send AI Response
  const handleGenerateAiReply = async () => {
    if (!selectedContact) return;

    const phone = selectedContact.phone || selectedContact.remoteJid?.replace('@s.whatsapp.net', '') || '';
    const lastMsg = messages[messages.length - 1]?.text || selectedContact.lastMessage || 'What services do you offer?';

    setGeneratingAi(true);
    setAiNotice(null);

    try {
      const res = await fetch('/api/chats/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: phone,
          lastCustomerMessage: lastMsg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: 'ai-' + Date.now(),
          from: 'agent',
          sender: 'Nexus AI Agent',
          text: data.reply,
          time: 'Just now',
          fromMe: true,
          toolUsed: data.toolUsed,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setAiNotice({
          tool: data.toolUsed,
          text: `AI response sent via Evolution API using ${data.toolUsed || '1-sentence constraint'}.`,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Filter contacts by search and tab
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery) ||
      (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'individual') return !c.isGroup;
    if (activeTab === 'groups') return c.isGroup;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header with Real Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-bold text-ink-900">Dashboard</h1>
            {connectionStatus === 'open' ? (
              <span className="flex items-center gap-1.5 rounded-full bg-whatsapp-50 px-3 py-0.5 text-xs font-bold text-whatsapp-700 border border-whatsapp-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp-500"></span>
                </span>
                WhatsApp Linked (Live)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-0.5 text-xs font-bold text-red-600 border border-red-200">
                <AlertCircle className="h-3.5 w-3.5" />
                WhatsApp Not Linked (Scan Required)
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {connectionStatus === 'open'
              ? 'Your WhatsApp is connected. View real contacts and automate 1-sentence AI responses.'
              : 'Please scan the live QR code below with your WhatsApp app (Linked Devices) to connect.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus === 'open' ? (
            <>
              <Button size="sm" onClick={checkConnectionAndContacts}>
                <RefreshCw className={`h-4 w-4 ${loadingContacts ? 'animate-spin' : ''}`} />
                Refresh Contacts
              </Button>
              <Button size="sm" variant="danger" onClick={handleDisconnect}>
                <Unplug className="h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={fetchDashboardQr}>
              <RefreshCw className={`h-4 w-4 ${qrLoading ? 'animate-spin' : ''}`} />
              Refresh QR Code
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="p-5">
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-400">
                      {stat.label}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                        stat.change >= 0 ? 'bg-whatsapp-50 text-whatsapp-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {stat.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-3xl font-bold text-ink-900">
                    {stat.label === 'Active Conversations'
                      ? (contacts.length > 0 ? contacts.length : (connectionStatus === 'open' ? stat.value : '0'))
                      : (connectionStatus === 'open' ? stat.value : (contacts.length > 0 ? '12' : '0'))}
                  </p>
                  <div className="mt-3">
                    <Sparkline data={connectionStatus === 'open' || contacts.length > 0 ? stat.sparkline : [0, 0, 0, 0, 0]} />
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CONDITIONAL CONTENT: IF WHATSAPP NOT LINKED AND NO CONTACTS -> SHOW LIVE QR CODE SCANNER */}
      {connectionStatus !== 'open' && contacts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-8 border-2 border-dashed border-whatsapp-300 bg-white shadow-md text-center">
            <div className="mx-auto max-w-md">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-whatsapp-100 text-whatsapp-700 mb-3">
                <QrCode className="h-6 w-6" />
              </span>
              <h2 className="font-serif text-2xl font-bold text-ink-900">
                Scan QR to Link WhatsApp
              </h2>
              <p className="mt-1 text-xs text-ink-500">
                Contacts and messages will appear here once you link your WhatsApp using the QR code below.
              </p>

              {/* QR Code Frame */}
              <div className="my-6 flex justify-center">
                <div
                  className="relative flex items-center justify-center rounded-2xl border-2 border-whatsapp-400 bg-white p-4 shadow-lg"
                  style={{ minHeight: '260px', minWidth: '260px' }}
                >
                  {qrLoading ? (
                    <div className="flex flex-col items-center gap-3 py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-whatsapp-500" />
                      <span className="text-xs text-ink-500 font-medium">Fetching QR from Evolution API...</span>
                    </div>
                  ) : dashboardQr ? (
                    <img
                      src={dashboardQr}
                      alt="Evolution API WhatsApp QR"
                      className="h-56 w-56 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-whatsapp-500" />
                      <span className="text-xs text-ink-500">Initializing QR stream...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and countdown */}
              <div className="flex items-center justify-between px-4 text-xs">
                <div className="flex items-center gap-2 text-ink-600">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-whatsapp-500">
                    <span className="h-full w-full animate-ping rounded-full bg-whatsapp-500 opacity-75" />
                  </span>
                  <span>Waiting for scan... (Refreshes in {qrTimer}s)</span>
                </div>
                <button
                  type="button"
                  onClick={fetchDashboardQr}
                  disabled={qrLoading}
                  className="font-semibold text-whatsapp-700 hover:text-whatsapp-800 flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${qrLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Step instructions */}
              <div className="mt-6 rounded-xl bg-cream-100 p-4 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-2">
                  Follow these steps:
                </p>
                <ol className="space-y-1.5 text-xs text-ink-600">
                  <li>1. Open WhatsApp on your mobile phone.</li>
                  <li>2. Tap <strong>Settings</strong> (or 3 dots menu on Android) → <strong>Linked Devices</strong>.</li>
                  <li>3. Tap <strong>Link a Device</strong> and point your phone camera at the QR code above.</li>
                </ol>
              </div>

              {/* Simulation Option for testing when CloudStation is sleeping */}
              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch('/api/simulate-connection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ connected: true })
                      });
                      setConnectionStatus('open');
                      const cRes = await fetch('/api/contacts');
                      if (cRes.ok) {
                        const cData = await cRes.json();
                        setContacts(cData.chats || []);
                      }
                    } catch (err) {
                      console.error('Error simulating connection:', err);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-whatsapp-500 bg-whatsapp-50/80 py-2.5 px-4 text-xs font-bold text-whatsapp-800 hover:bg-whatsapp-500 hover:text-white transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Simulate WhatsApp Scan (Bypass / Demo Mode)</span>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* IF WHATSAPP IS LINKED -> SHOW REAL CONTACTS & CONVERSATIONS */
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-900">
                WhatsApp Contacts & Active Chats
              </h2>
              <p className="text-xs text-ink-500">
                {contacts.length} real synced WhatsApp contacts. Click any chat to view messages or auto-respond with AI.
              </p>
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-cream-300 bg-white py-1.5 pl-8 pr-3 text-xs text-ink-800 outline-none focus:border-whatsapp-500 w-48 sm:w-60"
                />
              </div>

              <div className="flex rounded-xl border border-cream-300 bg-cream-100 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    activeTab === 'all' ? 'bg-white font-bold text-ink-900 shadow-2xs' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  All ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('individual')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    activeTab === 'individual' ? 'bg-white font-bold text-ink-900 shadow-2xs' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Direct Contacts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('groups')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    activeTab === 'groups' ? 'bg-white font-bold text-ink-900 shadow-2xs' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Groups
                </button>
              </div>
            </div>
          </div>

          {/* Contacts List Card */}
          <Card className="overflow-hidden border border-cream-300/80">
            {loadingContacts ? (
              <div className="divide-y divide-cream-300/60">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-ink-400">
                  <Inbox className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-bold text-ink-700">No contacts matching search</p>
                <p className="mt-1 text-xs text-ink-400">Try changing your query or click Refresh Contacts.</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-300/60 max-h-[600px] overflow-y-auto">
                {filteredContacts.map((conv, i) => (
                  <motion.div
                    key={conv.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                    onClick={() => handleSelectContact(conv)}
                    className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-cream-100"
                  >
                    <Avatar initials={conv.initials} color={conv.color} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-ink-900">{conv.name}</p>
                          {conv.phone && (
                            <span className="hidden sm:inline font-mono text-[11px] text-ink-400">
                              +{conv.phone}
                            </span>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-xs text-ink-400">{conv.timestamp}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-ink-500">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-whatsapp-500 px-1.5 text-[11px] font-bold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Conversation Drawer / Modal */}
      {selectedContact && (
        <Modal
          open={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          title={
            <div className="flex items-center gap-3">
              <Avatar initials={selectedContact.initials} color={selectedContact.color} size="sm" />
              <div>
                <p className="text-sm font-bold text-ink-900">{selectedContact.name}</p>
                <p className="text-[11px] text-ink-400 font-mono">
                  {selectedContact.phone ? `+${selectedContact.phone}` : selectedContact.remoteJid}
                </p>
              </div>
            </div>
          }
          footer={
            <div className="w-full space-y-3">
              {/* Quick AI Action Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-whatsapp-200 bg-whatsapp-50/80 p-2.5">
                <div className="flex items-center gap-2 text-xs text-whatsapp-800">
                  <Sparkles className="h-4 w-4 text-whatsapp-600 flex-shrink-0" />
                  <span>
                    <strong>Nexus AI Agent:</strong> 1-Sentence reply with Calendar & Sheets tools
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={generatingAi}
                  onClick={handleGenerateAiReply}
                  className="bg-whatsapp-600 hover:bg-whatsapp-700 text-white"
                >
                  {generatingAi ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating Reply...
                    </>
                  ) : (
                    <>
                      <Bot className="h-3.5 w-3.5" />
                      Auto-Respond with AI
                    </>
                  )}
                </Button>
              </div>

              {/* Direct message input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a custom WhatsApp message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-xs text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
                />
                <Button type="submit" size="sm" disabled={sendingMessage || !messageInput.trim()}>
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </form>
            </div>
          }
        >
          <div className="space-y-3 max-h-[380px] overflow-y-auto p-1">
            {aiNotice && (
              <div className="rounded-lg bg-whatsapp-100/70 p-2.5 text-xs text-whatsapp-800 border border-whatsapp-200 flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-whatsapp-600 flex-shrink-0" />
                <span>{aiNotice.text}</span>
              </div>
            )}

            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-whatsapp-500" />
                <span className="mt-2 text-xs text-ink-500">Loading conversation history...</span>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.fromMe || m.from === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                      m.fromMe || m.from === 'agent'
                        ? 'bg-whatsapp-500 text-white rounded-tr-xs'
                        : 'bg-cream-100 text-ink-900 rounded-tl-xs'
                    }`}
                  >
                    {m.toolUsed && (
                      <span className="mb-1 block text-[10px] font-bold text-whatsapp-200">
                        ⚡ Tool: {m.toolUsed}
                      </span>
                    )}
                    <p className="leading-relaxed">{m.text}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        m.fromMe || m.from === 'agent' ? 'text-whatsapp-200' : 'text-ink-400'
                      }`}
                    >
                      <span>{m.time}</span>
                      {(m.fromMe || m.from === 'agent') && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
