import { motion } from 'framer-motion';
import { Plug, BrainCircuit, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: Plug,
    title: 'Connect your WhatsApp',
    description: 'Link your business number in one click — no code, no technical setup required.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'Train your AI agent',
    description: 'Add your FAQs, product catalog, and brand voice. The AI learns in minutes.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Launch & automate',
    description: 'Go live and let WhatsApp Buddy handle conversations, follow-ups, and campaigns.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-cream-50 py-24 lg:py-32">
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
            How it Works
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            Up and running in{' '}
            <span className="italic text-whatsapp-600">three simple steps</span>
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            No technical expertise needed. Get started in under five minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16 lg:mt-20">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-whatsapp-300 to-transparent lg:block" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Number circle */}
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-cream-50 bg-whatsapp-500 text-white shadow-xl shadow-whatsapp-500/30">
                  <step.icon className="h-7 w-7" />
                </div>

                <span className="mt-6 block font-serif text-5xl font-bold text-whatsapp-200">
                  {step.number}
                </span>
                <h3 className="mt-2 text-xl font-bold text-ink-900">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
