import { motion } from 'framer-motion';
import { ArrowRight, Play, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const floatingAvatars = [
  { initials: 'AK', top: '18%', left: '6%', anim: 'animate-float-slow', color: 'bg-whatsapp-500' },
  { initials: 'SR', top: '52%', left: '10%', anim: 'animate-float-slower', color: 'bg-whatsapp-600' },
  { initials: 'JM', top: '70%', left: '4%', anim: 'animate-float-slowest', color: 'bg-whatsapp-400' },
  { initials: 'LP', top: '24%', left: '88%', anim: 'animate-float-slower', color: 'bg-whatsapp-600' },
  { initials: 'DT', top: '60%', left: '92%', anim: 'animate-float-slow', color: 'bg-whatsapp-500' },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-cream-50 pt-32 pb-24 lg:pt-40 lg:pb-32"
    >
      {/* Background chat-bubble outlines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full border border-whatsapp-200/40" />
        <div className="absolute left-1/4 -top-10 h-40 w-40 rounded-full border border-whatsapp-200/30" />
        <div className="absolute -right-16 top-32 h-96 w-96 rounded-full border border-whatsapp-200/30" />
        <div className="absolute right-1/3 bottom-0 h-56 w-56 rounded-full border border-whatsapp-200/25" />

        {/* Faint WhatsApp-style icons */}
        <MessageCircle className="absolute left-[12%] top-[40%] h-10 w-10 text-whatsapp-200/40" />
        <MessageCircle className="absolute right-[15%] top-[30%] h-8 w-8 text-whatsapp-200/35" />
        <MessageCircle className="absolute left-[40%] bottom-[12%] h-7 w-7 text-whatsapp-200/30" />

        {/* Soft pulse blobs */}
        <div className="absolute left-[5%] top-[35%] h-64 w-64 rounded-full bg-whatsapp-100/40 animate-bubble-pulse" />
        <div className="absolute right-[8%] top-[20%] h-80 w-80 rounded-full bg-whatsapp-50/50 animate-bubble-pulse [animation-delay:2s]" />
      </div>

      {/* Floating avatars */}
      {floatingAvatars.map((avatar, i) => (
        <motion.div
          key={avatar.initials}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.15, duration: 0.5, ease: 'backOut' }}
          className={`pointer-events-none absolute hidden md:flex h-14 w-14 items-center justify-center rounded-full ${avatar.color} text-white font-bold text-sm shadow-xl shadow-whatsapp-500/20 ring-4 ring-cream-50 ${avatar.anim}`}
          style={{ top: avatar.top, left: avatar.left }}
        >
          {avatar.initials}
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-whatsapp-200 bg-whatsapp-50/80 px-4 py-1.5 text-xs font-semibold text-whatsapp-700"
        >
          <span className="flex h-2 w-2 rounded-full bg-whatsapp-500" />
          AI-powered WhatsApp automation
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 text-balance sm:text-5xl lg:text-6xl"
        >
          The smartest way to{' '}
          <span className="italic text-whatsapp-600">automate your WhatsApp</span>{' '}
          conversations
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 text-balance"
        >
          WhatsApp Buddy uses AI to handle customer chats, schedule messages, and
          nurture leads — so you can scale your business without hiring more agents.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-whatsapp-500/30 transition-all hover:bg-whatsapp-600 hover:shadow-2xl hover:shadow-whatsapp-500/40 hover:-translate-y-0.5"
          >
            Try it Free
          </Link>
          <a
            href="#how-it-works"
            className="group inline-flex items-center gap-2 px-4 py-3.5 text-base font-semibold text-ink-700 transition-colors hover:text-whatsapp-600"
          >
            <Play className="h-4 w-4 fill-current" />
            See how it works
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-sm text-ink-400"
        >
          Trusted by <span className="font-bold text-ink-700">12,000+</span> businesses worldwide
        </motion.p>
      </div>
    </section>
  );
}
