import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "We cut response times from hours to seconds. Our customers love getting instant answers, even at 2 AM.",
    name: 'Amara Okafor',
    role: 'Founder, Bloom Cosmetics',
    initials: 'AO',
  },
  {
    quote: "The AI agent handles 80% of our routine questions automatically. My team finally has time to focus on complex cases.",
    name: 'Diego Martinez',
    role: 'Ops Lead, MercadoFresh',
    initials: 'DM',
  },
  {
    quote: "Setting up WhatsApp Buddy took ten minutes. By the end of the week our conversion rate had jumped 35%.",
    name: 'Priya Sharma',
    role: 'Marketing Director, LuxeStay',
    initials: 'PS',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-cream-50 py-24 lg:py-32">
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
            Testimonials
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            Loved by businesses{' '}
            <span className="italic text-whatsapp-600">big and small</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col rounded-3xl border border-cream-300/70 bg-cream-100 p-8 transition-all hover:shadow-xl hover:shadow-whatsapp-500/10"
            >
              {/* Stars */}
              <div className="flex gap-1 text-whatsapp-500">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-5 flex-1 text-base leading-relaxed text-ink-700">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-cream-300/60 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp-500 text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
