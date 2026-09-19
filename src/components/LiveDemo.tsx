import { motion } from 'framer-motion';
import { CheckCheck, Phone, Video, MoreVertical, ArrowLeft, Signal } from 'lucide-react';

interface Message {
  from: 'customer' | 'agent';
  text: string;
  time: string;
  showChecks?: boolean;
}

const messages: Message[] = [
  { from: 'customer', text: 'Hi! Do you have the wireless earbuds in stock?', time: '10:24 AM' },
  { from: 'agent', text: "Hi there! Yes, our ProBuds X2 are in stock — £49.99. Would you like to order?", time: '10:24 AM', showChecks: true },
  { from: 'customer', text: "Great! Can I get them in black?", time: '10:25 AM' },
  { from: 'agent', text: "Absolutely! Black is available. I can place your order right now and ship it today. Shall I proceed?", time: '10:25 AM', showChecks: true },
  { from: 'customer', text: "Yes please!", time: '10:26 AM' },
  { from: 'agent', text: "Order confirmed! Your ProBuds X2 (Black) will arrive by Thursday. Tracking link sent to your email.", time: '10:26 AM', showChecks: true },
];

export default function LiveDemo() {
  return (
    <section id="demo" className="relative overflow-hidden bg-cream-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Caption */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-wider text-whatsapp-600">
            Live Demo
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            See it <span className="italic text-whatsapp-600">in action</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            A real conversation between a customer and the WhatsApp Buddy AI agent.
          </p>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="mt-16 flex justify-center"
        >
          <div className="relative h-[640px] w-[320px] rounded-[2.8rem] border-[10px] border-ink-900 bg-ink-900 shadow-2xl shadow-ink-900/30">
            {/* Notch */}
            <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-ink-900" />

            {/* Screen */}
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#E5DDD5]">
              {/* WhatsApp chat background pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-rule='evenodd'%3E%3Cpath d='M30 20c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm-20 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z'/%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />

              {/* Green header bar */}
              <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-[#075E54] px-4 py-2.5 text-white shadow-md">
                <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-whatsapp-500 text-sm font-bold">
                  WB
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">WhatsApp Buddy AI</p>
                  <p className="text-[11px] text-green-100/80">online</p>
                </div>
                <Video className="h-5 w-5 flex-shrink-0" />
                <Phone className="h-5 w-5 flex-shrink-0" />
                <MoreVertical className="h-5 w-5 flex-shrink-0" />
              </div>

              {/* Messages */}
              <div className="absolute inset-x-0 bottom-0 top-[60px] space-y-2 overflow-y-auto px-3 py-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.4 }}
                    className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-[78%] rounded-lg px-3 py-2 text-[13px] leading-snug shadow-sm ${
                        msg.from === 'agent'
                          ? 'rounded-tr-sm bg-[#DCF8C6] text-ink-900'
                          : 'rounded-tl-sm bg-white text-ink-900'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <span className="text-[10px] text-ink-400">{msg.time}</span>
                        {msg.showChecks && (
                          <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.8, duration: 0.4 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1 rounded-lg rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-ink-400 animate-typing" />
                    <span className="h-2 w-2 rounded-full bg-ink-400 animate-typing [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-ink-400 animate-typing [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              </div>

              {/* Input bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-[#F0F0F0] px-3 py-2">
                <div className="flex-1 rounded-full bg-white px-4 py-2 text-[12px] text-ink-400">
                  Message
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp-500 text-white">
                  <Signal className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
