import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  RefreshCw,
  Users,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import Logo from '@/components/Logo';
import FloatingDecorations from '@/components/FloatingDecorations';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('waiting'); // 'waiting', 'connected'
  const [qrCode, setQrCode] = useState(null);
  const [contactCount, setContactCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrTimer, setQrTimer] = useState(25);
  const [apiError, setApiError] = useState(null);
  const [isSimulatedConnected, setIsSimulatedConnected] = useState(false);

  const { completeOnboarding, simulateConnection } = useAuth();
  const navigate = useNavigate();

  // Fetch real QR code from Evolution API
  const fetchQr = async () => {
    setIsRefreshing(true);
    setApiError(null);
    try {
      const res = await fetch('/api/qr');
      if (res.ok) {
        const data = await res.json();
        if (data.connectionState === 'open') {
          setStatus('connected');
          setQrCode(null);
        } else {
          setStatus('waiting');
          if (data.base64) {
            setQrCode(data.base64);
            setQrTimer(25);
          } else if (data.fallbackQr) {
            // CloudStation is sleeping or offline, show demo QR
            setQrCode(data.fallbackQr);
            if (data.error) {
              setApiError(data.error);
            }
          } else if (data.error) {
            setApiError(data.error);
          }
        }
      } else {
        setApiError('Unable to reach backend API. Ensure the backend server is running on port 5000.');
      }
    } catch (err) {
      console.error('Error fetching QR:', err);
      setApiError('Failed to communicate with WhatsApp gateway.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQr();
  }, []);

  // Countdown timer for QR refresh
  useEffect(() => {
    if (status === 'connected') return;

    const timer = setInterval(() => {
      setQrTimer((prev) => {
        if (prev <= 1) {
          fetchQr();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Continuously poll real connection state from Evolution API
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/connection-state');
        if (res.ok) {
          const data = await res.json();
          if (data.state === 'open') {
            setStatus('connected');
            // Fetch real contacts count
            const cRes = await fetch('/api/contacts');
            if (cRes.ok) {
              const cData = await cRes.json();
              setContactCount(cData.total || cData.chats?.length || 0);
            }
          } else {
            // If disconnected, revert to waiting and fetch QR
            if (status === 'connected') {
              setStatus('waiting');
              fetchQr();
            }
          }
        }
      } catch {
        // network polling error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [status]);

  // Handler for disconnecting and scanning fresh QR code
  const handleDisconnectAndRescan = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/disconnect', { method: 'POST' });
      setStatus('waiting');
      setQrCode(null);
      setTimeout(() => {
        fetchQr();
      }, 1000);
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handler for simulating WhatsApp scan (bypasses CloudStation 503 downtime)
  const handleSimulateScan = async () => {
    setIsRefreshing(true);
    await simulateConnection(true);
    setIsSimulatedConnected(true);
    setStatus('connected');
    setContactCount(5);
    setIsRefreshing(false);
  };

  const handleContinue = () => {
    completeOnboarding('+91 87664 38685');
    navigate('/dashboard');
  };

  const isCloudStationIssue = apiError && (apiError.includes('503') || apiError.includes('CloudStation') || apiError.includes('sleeping'));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-5 py-12">
      <FloatingDecorations />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-cream-300/70 bg-cream-50 p-8 shadow-xl shadow-whatsapp-500/5">
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    s <= step
                      ? 'bg-whatsapp-500 text-white'
                      : 'bg-cream-200 text-ink-400'
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`h-0.5 w-12 rounded-full transition-all ${s < step ? 'bg-whatsapp-500' : 'bg-cream-300'}`} />
                )}
              </div>
            ))}
          </div>

          <p className="mb-1 text-center text-xs font-bold uppercase tracking-wider text-whatsapp-600">
            Step {step} of 2
          </p>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-center font-serif text-2xl font-bold text-ink-900">
                  Scan QR to Link WhatsApp
                </h1>
                <p className="mt-2 text-center text-xs sm:text-sm text-ink-500">
                  Point your WhatsApp camera at this live QR code. Contacts will sync automatically once scanned.
                </p>

                {/* CloudStation 503 / Offline Diagnostic Banner */}
                {apiError && (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-900 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-amber-950">
                          {isCloudStationIssue ? 'CloudStation Instance Sleeping (HTTP 503)' : 'Evolution API Gateway Notice'}
                        </p>
                        <p className="text-[11px] leading-relaxed text-amber-800/90">
                          {apiError}
                        </p>
                        {isCloudStationIssue && (
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <a
                              href="https://app.cloud-station.io"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-black underline underline-offset-2"
                            >
                              Open CloudStation Console
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <span className="text-amber-400">•</span>
                            <span className="text-[11px] text-amber-700">or use Simulation Mode below to test immediately</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* QR code card */}
                <div className="my-6 flex justify-center">
                  <div
                    className="relative flex items-center justify-center rounded-2xl border-2 border-whatsapp-300 bg-white p-5 shadow-lg shadow-whatsapp-500/20"
                    style={{ minHeight: '270px', minWidth: '270px' }}
                  >
                    {status === 'connected' ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-3 py-6"
                      >
                        <CheckCircle2 className="h-14 w-14 text-whatsapp-500" fill="rgba(37, 211, 102, 0.15)" />
                        <div className="text-center">
                          <p className="text-base font-bold text-whatsapp-700">
                            {isSimulatedConnected ? 'WhatsApp Linked (Demo Simulation Mode)' : 'WhatsApp Linked Successfully!'}
                          </p>
                          <p className="text-xs text-ink-600 mt-1 flex items-center justify-center gap-1.5 font-medium">
                            <Users className="h-4 w-4 text-whatsapp-600" />
                            <span>{contactCount > 0 ? `${contactCount} contacts synchronized` : 'Contacts & chats synced'}</span>
                          </p>
                        </div>
                      </motion.div>
                    ) : qrCode ? (
                      <div className="flex flex-col items-center relative">
                        <img
                          src={qrCode}
                          alt="Evolution API Live WhatsApp QR Code"
                          className="h-60 w-60 rounded-xl object-contain"
                        />
                        {isCloudStationIssue && (
                          <span className="absolute bottom-2 rounded-full bg-cream-900/80 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                            Preview QR (CloudStation Sleeping)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-whatsapp-500" />
                        <span className="text-xs text-ink-500 font-medium">Loading live QR from Evolution API...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status indicator & auto-refresh countdown */}
                {status !== 'connected' && (
                  <div className="flex items-center justify-between px-2 text-xs">
                    <div className="flex items-center gap-2 text-ink-600">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-whatsapp-500">
                        <span className="h-full w-full animate-ping rounded-full bg-whatsapp-500 opacity-75" />
                      </span>
                      <span>Waiting for scan... (Refreshes in {qrTimer}s)</span>
                    </div>

                    <button
                      type="button"
                      onClick={fetchQr}
                      disabled={isRefreshing}
                      className="flex items-center gap-1 text-whatsapp-700 hover:text-whatsapp-800 font-semibold"
                    >
                      <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                )}

                {/* Mobile instructions */}
                <div className="mt-5 rounded-xl bg-cream-100 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-2">
                    How to scan with your phone:
                  </p>
                  <ol className="space-y-1.5 text-xs text-ink-600">
                    <li className="flex gap-2">
                      <span className="font-bold text-whatsapp-600">1.</span>
                      Open WhatsApp on your phone
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-whatsapp-600">2.</span>
                      Tap <strong>Settings</strong> (or 3 dots on Android) → <strong>Linked Devices</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-whatsapp-600">3.</span>
                      Tap <strong>Link a Device</strong> and point your camera at this QR code
                    </li>
                  </ol>
                </div>

                {/* Simulation Option & Action Buttons */}
                <div className="mt-6 space-y-3">
                  {status === 'connected' ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <Button fullWidth size="lg" onClick={() => setStep(2)}>
                        Continue with Linked WhatsApp
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <button
                        type="button"
                        onClick={handleDisconnectAndRescan}
                        className="w-full text-center text-xs font-semibold text-ink-500 hover:text-red-600 underline py-1 transition"
                      >
                        Not connected or want to re-scan? Disconnect & Show QR Code
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSimulateScan}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-whatsapp-500 bg-whatsapp-500/10 px-4 py-3 text-xs font-bold text-whatsapp-800 transition hover:bg-whatsapp-500 hover:text-white"
                      >
                        <Zap className="h-4 w-4 text-whatsapp-600 group-hover:text-white transition" />
                        <span>Simulate WhatsApp Scan (Bypass / Demo Mode)</span>
                        <Sparkles className="h-3.5 w-3.5 opacity-80" />
                      </button>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span>This page advances automatically when your camera scans the code or when using Demo Mode.</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-center font-serif text-2xl font-bold text-ink-900">
                  Select your AI Agent Persona
                </h1>
                <p className="mt-2 text-center text-sm text-ink-500">
                  Your WhatsApp is linked. Choose how your AI agent should autonomously reply to incoming chats.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      title: 'Nexus Agency Consultant',
                      desc: 'Answers pricing & services in 1 sentence; books Google Calendar consultations.',
                      icon: '💼',
                      featured: true
                    },
                    {
                      title: 'Customer Support',
                      desc: 'Handles inquiries, order questions, and refunds with polite empathy.',
                      icon: '🎧'
                    },
                    {
                      title: 'Personal Assistant',
                      desc: 'Manages schedules, daily reminders, and tasks concisely.',
                      icon: '⚡'
                    }
                  ].map((p) => (
                    <button
                      key={p.title}
                      onClick={() => setStep(2)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        p.featured
                          ? 'border-whatsapp-400 bg-whatsapp-50/70 ring-1 ring-whatsapp-400'
                          : 'border-cream-300 bg-cream-50 hover:border-whatsapp-300 hover:bg-whatsapp-50'
                      }`}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-200 text-xl">
                        {p.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-ink-900">{p.title}</p>
                          {p.featured && (
                            <span className="rounded bg-whatsapp-200/80 px-2 py-0.5 text-[10px] font-bold text-whatsapp-800">
                              Active Automation
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <Button fullWidth size="lg" onClick={handleContinue}>
                    Open Dashboard & View Contacts
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
