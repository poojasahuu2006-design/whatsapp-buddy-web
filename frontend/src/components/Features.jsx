import { motion } from 'framer-motion';
import { Bot, CalendarClock, BarChart3, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Auto-Reply',
    description: 'Train your AI agent on FAQs and let it respond to customers 24/7 in natural language.',
  },
  {
    icon: CalendarClock,
    title: 'Smart Scheduling',
    description: 'Schedule campaigns and follow-ups to land at the perfect moment, every time.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track delivery, open rates, and conversation metrics in a single dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Compliant',
    description: 'End-to-end encryption and GDPR-ready data handling keep your conversations safe.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-cream-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-wider text-whatsapp-600">
            Features
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            Everything you need to{' '}
            <span className="italic text-whatsapp-600">scale conversations</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Powerful automation tools that work together to grow your WhatsApp presence.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group rounded-3xl border border-cream-300/70 bg-cream-50 p-8 transition-all hover:border-whatsapp-300 hover:shadow-xl hover:shadow-whatsapp-500/10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-whatsapp-50 text-whatsapp-600 transition-all group-hover:bg-whatsapp-500 group-hover:text-white">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-ink-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
