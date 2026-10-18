import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Loader2,
  CalendarCheck,
  User,
  Phone
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarEmail, setCalendarEmail] = useState('poojasahuu2006@gmail.com');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // New Event Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [requestedTime, setRequestedTime] = useState('tomorrow at 4:00 PM');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Test Notification
  const [testNotice, setTestNotice] = useState(null);
  const [testingBooking, setTestingBooking] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        if (data.calendarEmail) setCalendarEmail(data.calendarEmail);
        if (data.timezone) setTimezone(data.timezone);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Quick Test Schedule
  const handleTestSchedule = async () => {
    setTestingBooking(true);
    setTestNotice(null);

    try {
      const res = await fetch('/api/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'Pooja Sahu (Test)',
          clientNumber: '918766438685',
          requestedTimeText: 'tomorrow at 4:00 PM',
          summary: 'Discovery Consultation: Nexus Agency & Pooja Sahu'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestNotice({
          success: true,
          title: 'Consultation Successfully Scheduled on Google Calendar!',
          message: data.confirmationSentence,
          event: data.event
        });
        fetchEvents();
      }
    } catch (err) {
      setTestNotice({
        success: false,
        title: 'Scheduling Error',
        message: err.message
      });
    } finally {
      setTestingBooking(false);
    }
  };

  // Schedule Custom Event
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedTime) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName || 'Client',
          clientNumber: clientNumber || '',
          requestedTimeText: requestedTime,
          summary
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestNotice({
          success: true,
          title: 'Task Added to Google Calendar!',
          message: data.confirmationSentence,
          event: data.event
        });
        setModalOpen(false);
        setClientName('');
        setClientNumber('');
        setSummary('');
        fetchEvents();
      }
    } catch (err) {
      alert('Error scheduling task: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this calendar event?')) return;
    try {
      await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-bold text-ink-900">
              Google Calendar Tasks
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <CalendarCheck className="h-3.5 w-3.5" />
              Calendar Ready
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Host: <strong className="font-mono text-ink-800">{calendarEmail}</strong> • Timezone: <strong className="font-mono text-ink-800">{timezone} (IST)</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={testingBooking}
            onClick={handleTestSchedule}
            className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          >
            {testingBooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                Scheduling Call...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-600" />
                🧪 Test Schedule Booking
              </>
            )}
          </Button>

          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Schedule New Task
          </Button>
        </div>
      </div>

      {/* Test Notice Banner */}
      <AnimatePresence>
        {testNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-5 ${
              testNotice.success
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">{testNotice.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed">{testNotice.message}</p>
                  {testNotice.event?.googleCalendarUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href={testNotice.event.googleCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open & Add to Google Calendar
                      </a>
                      <span className="text-[11px] text-emerald-700 font-mono">
                        Start: {testNotice.event.startTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setTestNotice(null)}
                className="text-xs font-bold text-ink-400 hover:text-ink-700"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Events List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink-900">
            Scheduled Tasks & Consultations
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchEvents}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="overflow-hidden border border-cream-300">
          {loading ? (
            <div className="divide-y divide-cream-300/60 p-4 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarIcon className="h-12 w-12 text-ink-300 mb-3" />
              <p className="text-sm font-bold text-ink-700">No scheduled calendar tasks yet</p>
              <p className="text-xs text-ink-400 mt-1">
                Tasks booked by customers on WhatsApp or created manually will appear here.
              </p>
              <Button size="sm" className="mt-4" onClick={handleTestSchedule}>
                Run Test Booking
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-cream-300/60">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-cream-100/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <CalendarCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-ink-900">{evt.summary}</h3>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Confirmed
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-ink-500">
                        <span className="flex items-center gap-1 font-semibold text-ink-800">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          {evt.displayTime}
                        </span>
                        {evt.clientName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-ink-400" />
                            {evt.clientName}
                          </span>
                        )}
                        {evt.clientNumber && (
                          <span className="flex items-center gap-1 font-mono text-ink-600">
                            <Phone className="h-3.5 w-3.5 text-ink-400" />
                            +{evt.clientNumber}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 font-mono text-[11px] text-ink-400">
                        Host: {evt.calendarEmail} • ISO: {evt.startTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {evt.googleCalendarUrl && (
                      <a
                        href={evt.googleCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-2xs hover:border-whatsapp-400 hover:text-whatsapp-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in Google Calendar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Cancel Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Schedule Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Google Calendar Task"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSubmit} disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Confirm & Schedule'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
              Task / Meeting Summary
            </label>
            <input
              type="text"
              placeholder="e.g. Discovery Call with Nexus Agency"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
              Date & Time (Natural Language or Exact)
            </label>
            <input
              type="text"
              placeholder="e.g. tomorrow at 4:00 PM, today at 5pm, 23 Sept at 11am"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
            />
            <span className="text-[11px] text-ink-400 mt-0.5 block">
              Auto-calculates start/end times in Asia/Kolkata (IST) timezone.
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                Client Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 919876543210"
                value={clientNumber}
                onChange={(e) => setClientNumber(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 p-2.5 text-xs font-mono text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
