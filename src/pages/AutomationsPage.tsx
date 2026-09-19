import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ChevronDown, Clock, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { automationRuns, type AutomationRun } from '@/data/mockData';

const statusConfig = {
  success: {
    bg: 'bg-whatsapp-50',
    text: 'text-whatsapp-700',
    border: 'border-whatsapp-200',
    badge: 'bg-whatsapp-500',
    label: 'Success',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    badge: 'bg-red-500',
    label: 'Error',
    icon: XCircle,
  },
  running: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    badge: 'bg-amber-500',
    label: 'Running',
    icon: Loader2,
  },
} as const;

export default function AutomationsPage() {
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRuns(automationRuns);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">Automations</h1>
          <p className="mt-1 text-sm text-ink-500">Monitor your automation runs and execution logs.</p>
        </div>
        <Button size="sm">
          <Zap className="h-4 w-4" />
          New Automation
        </Button>
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="divide-y divide-cream-300/60">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5">
                <Skeleton className="h-8 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-cream-300/60">
            {runs.map((run, i) => {
              const config = statusConfig[run.status];
              const isExpanded = expandedId === run.id;
              let parsed: { steps?: { step: string; status: string }[]; [k: string]: unknown } | null = null;
              try {
                parsed = JSON.parse(run.details);
              } catch {
                parsed = null;
              }

              return (
                <motion.div key={run.id}>
                  <button
                    onClick={() => toggleExpand(run.id)}
                    className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-cream-100"
                  >
                    {/* Status badge */}
                    <span
                      className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.bg} ${config.text} ${config.border} border`}
                    >
                      <config.icon className={`h-3.5 w-3.5 ${run.status === 'running' ? 'animate-spin' : ''}`} />
                      {config.label}
                    </span>

                    {/* Name + timestamp */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">{run.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                        <Clock className="h-3 w-3" />
                        {run.timestamp}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="hidden flex-shrink-0 text-xs font-medium text-ink-500 sm:block">
                      {run.duration}
                    </span>

                    {/* Chevron */}
                    <ChevronDown
                      className={`flex-shrink-0 h-4 w-4 text-ink-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-cream-100 p-5">
                          {parsed?.steps ? (
                            <div className="space-y-2">
                              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">
                                Execution Steps
                              </p>
                              {parsed.steps.map((step, si) => (
                                <div key={si} className="flex items-center gap-3 rounded-lg bg-cream-50 px-3 py-2">
                                  <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                      step.status === 'done'
                                        ? 'bg-whatsapp-500 text-white'
                                        : step.status === 'error'
                                        ? 'bg-red-500 text-white'
                                        : step.status === 'running'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-cream-300 text-ink-400'
                                    }`}
                                  >
                                    {step.status === 'done' ? '✓' : step.status === 'error' ? '✕' : si + 1}
                                  </span>
                                  <span className="text-sm text-ink-700">{step.step}</span>
                                  <span className="ml-auto text-xs font-medium capitalize text-ink-400">
                                    {step.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <pre className="overflow-x-auto rounded-lg bg-ink-900 p-4 text-xs text-green-300">
                              {run.details}
                            </pre>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
