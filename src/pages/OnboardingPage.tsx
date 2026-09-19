import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Smartphone, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import FloatingDecorations from '@/components/FloatingDecorations';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

type Status = 'waiting' | 'scanning' | 'connected';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>('waiting');
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  // Simulate QR scan progression
  useEffect(() => {
    if (status === 'scanning') {
      const timer = setTimeout(() => setStatus('connected'), 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Auto-advance from waiting to scanning after a few seconds for demo realism
  useEffect(() => {
    if (status === 'waiting') {
      const timer = setTimeout(() => setStatus('scanning'), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSimulateScan = () => {
    if (status === 'waiting') setStatus('scanning');
  };

  const handleContinue = () => {
    completeOnboarding('+1 (555) 014-2893');
    navigate('/dashboard');
  };

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
                  Connect your WhatsApp
                </h1>
                <p className="mt-2 text-center text-sm text-ink-500">
                  Scan the QR code with your WhatsApp app to link your number.
                </p>

                {/* QR code card */}
                <div className="my-8 flex justify-center">
                  <div className="relative rounded-2xl border-2 border-whatsapp-300 bg-white p-6 shadow-lg shadow-whatsapp-500/20 transition-all" style={{ boxShadow: '0 0 30px rgba(37, 211, 102, 0.25)' }}>
                    {/* QR pattern (CSS-only faux QR) */}
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 144 }).map((_, i) => {
                        const seed = (i * 7 + 13) % 5;
                        const isCorner = (i < 3 || i % 12 < 3 || i % 12 > 8 || i > 131) && ((i < 36) || (i > 107) || (i % 12 < 3) || (i % 12 > 8));
                        return (
                          <div
                            key={i}
                            className={`h-3.5 w-3.5 rounded-sm ${
                              isCorner ? (seed < 3 ? 'bg-ink-900' : 'bg-transparent') : seed < 2 ? 'bg-ink-900' : 'bg-transparent'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Status overlay */}
                    <AnimatePresence>
                      {status !== 'waiting' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-cream-50/95 backdrop-blur-sm"
                        >
                          {status === 'scanning' && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col items-center gap-3"
                            >
                              <Loader2 className="h-10 w-10 animate-spin text-whatsapp-500" />
                              <p className="text-sm font-bold text-ink-700">Scanning...</p>
                            </motion.div>
                          )}
                          {status === 'connected' && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col items-center gap-3"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                              >
                                <CheckCircle2 className="h-12 w-12 text-whatsapp-500" fill="rgba(37, 211, 102, 0.15)" />
                              </motion.div>
                              <p className="text-sm font-bold text-whatsapp-700">Connected!</p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status text */}
                <div className="flex items-center justify-center gap-2">
                  {status === 'waiting' && (
                    <>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-whatsapp-500">
                        <span className="h-full w-full animate-ping rounded-full bg-whatsapp-500 opacity-75" />
                      </span>
                      <span className="text-sm font-medium text-ink-500">Waiting for scan...</span>
                    </>
                  )}
                  {status === 'scanning' && (
                    <span className="text-sm font-medium text-ink-500">Scanning your device...</span>
                  )}
                  {status === 'connected' && (
                    <span className="text-sm font-bold text-whatsapp-600">WhatsApp linked successfully!</span>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-6 rounded-xl bg-cream-100 p-4">
                  <ol className="space-y-2 text-xs text-ink-600">
                    <li className="flex gap-2">
                      <span className="font-bold text-whatsapp-600">1.</span>
                      Open WhatsApp on your phone
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-whatsapp-600">2.</span>
                      Go to Settings → Linked Devices
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-whatsapp-600">3.</span>
                      Scan the QR code above
                    </li>
                  </ol>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3">
                  {status === 'waiting' && (
                    <Button variant="outline" fullWidth onClick={handleSimulateScan}>
                      <Smartphone className="h-4 w-4" />
                      Simulate Scan (Demo)
                    </Button>
                  )}
                  {status === 'connected' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button fullWidth size="lg" onClick={() => setStep(2)}>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
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
                  Pick your first persona
                </h1>
                <p className="mt-2 text-center text-sm text-ink-500">
                  Choose how your AI agent should behave. You can change this later.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    { title: 'Customer Support', desc: 'Handles product questions, orders, and refunds.', icon: '🎧' },
                    { title: 'Personal Assistant', desc: 'Manages reminders, schedules, and daily tasks.', icon: '💼' },
                    { title: 'Study Buddy', desc: 'Helps students with study schedules and quizzes.', icon: '📚' },
                  ].map((p, i) => (
                    <button
                      key={p.title}
                      onClick={() => {
                        if (i === 0) setStep(2); // just visual
                      }}
                      className="flex w-full items-center gap-4 rounded-xl border border-cream-300 bg-cream-50 p-4 text-left transition-all hover:border-whatsapp-300 hover:bg-whatsapp-50"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-200 text-xl">
                        {p.icon}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink-900">{p.title}</p>
                        <p className="text-xs text-ink-500">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <Button fullWidth size="lg" onClick={handleContinue}>
                    Continue to Dashboard
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
