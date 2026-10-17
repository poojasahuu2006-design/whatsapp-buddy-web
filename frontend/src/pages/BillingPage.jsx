import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { plans } from '@/data/mockData';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const messagesUsed = 1284;
  const messagesLimit = 2000;
  const usagePercent = Math.round((messagesUsed / messagesLimit) * 100);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink-900">Billing</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your plan and usage.</p>
      </div>

      {/* Current plan + usage */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-whatsapp-50 px-3 py-1 text-xs font-bold text-whatsapp-700">
                      Current Plan
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-ink-900">Free Plan</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">You're on the free tier. Upgrade for more features.</p>
                </div>
                <Button>
                  <Sparkles className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>

              {/* Usage bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-600">Messages this month</span>
                  <span className="font-bold text-ink-900">
                    {messagesUsed.toLocaleString()} / {messagesLimit.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-cream-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-whatsapp-400 to-whatsapp-600"
                  />
                </div>
                <p className="mt-2 text-xs text-ink-400">
                  {messagesLimit - messagesUsed} messages remaining this month
                </p>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* Pricing table */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-bold text-ink-900">Available Plans</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-24" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                    <Skeleton className="h-10 w-full rounded-full" />
                  </div>
                </Card>
              ))
            : plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card
                    className={`relative flex h-full flex-col p-6 ${
                      plan.highlighted
                        ? 'border-2 border-whatsapp-500 shadow-lg shadow-whatsapp-500/10'
                        : ''
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-whatsapp-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-serif text-4xl font-bold text-ink-900">{plan.price}</span>
                      <span className="text-sm text-ink-400">{plan.period}</span>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-ink-600">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-whatsapp-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <Button
                        variant={plan.highlighted ? 'primary' : plan.name === 'Free' ? 'secondary' : 'outline'}
                        fullWidth
                        disabled={plan.name === 'Free'}
                      >
                        {plan.name !== 'Free' && <Zap className="h-4 w-4" />}
                        {plan.cta}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
}
