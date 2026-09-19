import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Inbox, EyeOff } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Sparkline from '@/components/ui/Sparkline';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { stats, conversations } from '@/data/mockData';

type ListState = 'loading' | 'loaded' | 'empty' | 'error';

export default function DashboardHome() {
  const [listState, setListState] = useState<ListState>('loading');
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatsLoading(false);
      setListState('loaded');
    }, 1200);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats row */}
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
                        stat.change >= 0
                          ? 'bg-whatsapp-50 text-whatsapp-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {stat.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-3xl font-bold text-ink-900">
                    {stat.value}
                  </p>
                  <div className="mt-3">
                    <Sparkline data={stat.sparkline} />
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent conversations */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold text-ink-900">Recent Conversations</h2>

          {/* Demo state toggles */}
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setListState('loaded')}>
              Loaded
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setListState('empty')}>
              Empty
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setListState('error')}>
              Error
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setListState('loading')}>
              Loading
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          {listState === 'loading' && (
            <div className="divide-y divide-cream-300/60">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          )}

          {listState === 'loaded' && (
            <div className="divide-y divide-cream-300/60">
              {conversations.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-cream-100"
                >
                  <Avatar initials={conv.initials} color={conv.color} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-ink-900">{conv.name}</p>
                      <span className="flex-shrink-0 text-xs text-ink-400">{conv.timestamp}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink-500">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-whatsapp-500 px-2 text-xs font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {listState === 'empty' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-ink-400">
                <Inbox className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-bold text-ink-700">No conversations yet</p>
              <p className="mt-1 text-xs text-ink-400">New customer chats will appear here.</p>
            </div>
          )}

          {listState === 'error' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertCircle className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-bold text-ink-700">Failed to load conversations</p>
              <p className="mt-1 text-xs text-ink-400">Something went wrong. Please try again.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setListState('loading')}>
                Retry
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
