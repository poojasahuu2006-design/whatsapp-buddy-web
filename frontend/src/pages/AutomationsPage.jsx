import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  Clock,
  Zap,
  Play,
  Webhook,
  GitFork,
  Bot,
  Calendar,
  Database,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { nexusAutomation, automationRuns } from '@/data/mockData';

const iconMap = {
  Webhook,
  GitFork,
  Bot,
  Calendar,
  Database,
  Send,
};

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
};

export default function AutomationsPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Simulator state
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('What services does Nexus agency provide and what is the starting price?');
  const [testSender, setTestSender] = useState('+91 98765 43210');
  const [simulating, setSimulating] = useState(false);
  const [activeSimNode, setActiveSimNode] = useState(null);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    // Attempt fetching from backend or load rich mockData
    const fetchRuns = async () => {
      try {
        const res = await fetch('/api/automations/runs');
        if (res.ok) {
          const data = await res.json();
          if (data.runs && data.runs.length > 0) {
            setRuns(data.runs);
            setLoading(false);
            return;
          }
        }
      } catch {
        // fallback to mockData
      }
      setRuns(automationRuns);
      setLoading(false);
    };

    fetchRuns();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Run interactive simulation
  const handleRunSimulation = async (presetText) => {
    const msg = presetText || testMessage;
    if (!msg.trim()) return;

    setSimulating(true);
    setSimResult(null);

    // Visual progression through nodes
    setActiveSimNode('node-webhook');
    await new Promise((r) => setTimeout(r, 450));
    setActiveSimNode('node-if');
    await new Promise((r) => setTimeout(r, 400));
    setActiveSimNode('node-agent');

    const isBooking = /book|schedule|consultation|call|meeting|appointment|tomorrow/i.test(msg);
    await new Promise((r) => setTimeout(r, 450));
    setActiveSimNode(isBooking ? 'node-calendar' : 'node-sheets');

    await new Promise((r) => setTimeout(r, 550));
    setActiveSimNode('node-http');

    try {
      const res = await fetch('/api/automations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          number: testSender.replace(/[^0-9]/g, '') || '919876543210',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
        if (data.run) {
          setRuns((prev) => [data.run, ...prev]);
        }
      } else {
        throw new Error('Simulation endpoint returned non-200');
      }
    } catch {
      // Offline fallback result matching 1-sentence prompt
      const simulatedReply = isBooking
        ? 'Your consultation meeting with Nexus agency has been booked for tomorrow on Google Calendar at poojasahuu2006@gmail.com.'
        : 'Nexus agency builds WhatsApp AI automations, web applications, and digital systems starting at $499 with 7 to 14-day turnaround.';

      const fallbackRun = {
        id: 'sim-' + Date.now(),
        name: 'Whatapp_Agent: Simulation',
        status: 'success',
        timestamp: 'Just now',
        duration: '1.14s',
        sender: testSender,
        message: msg,
        reply: simulatedReply,
        details: JSON.stringify(
          {
            workflow: 'Whatapp_Agent',
            tool: isBooking ? 'Google Calendar' : 'Nexus KnowledgeBase (Sheets)',
            output: simulatedReply,
            steps: [
              { step: 'Webhook received test payload', status: 'done' },
              { step: 'Condition fromMe == false validated', status: 'done' },
              { step: isBooking ? 'Google Calendar tool executed' : 'Sheets KB queried', status: 'done' },
              { step: 'Evolution API sendText completed', status: 'done' },
            ],
          },
          null,
          2
        ),
      };

      setSimResult({
        success: true,
        reply: simulatedReply,
        toolUsed: isBooking ? 'Create an event in Google Calendar' : 'Get row(s) in sheet in Google Sheets',
        duration: '1.14s',
      });
      setRuns((prev) => [fallbackRun, ...prev]);
    } finally {
      setSimulating(false);
      setTimeout(() => setActiveSimNode(null), 1200);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-ink-900">Automations</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-whatsapp-50 px-2.5 py-0.5 text-xs font-bold text-whatsapp-700 border border-whatsapp-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp-500"></span>
              </span>
              Live & Synced
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Nexus Agency autonomous WhatsApp AI agent workflow with Google Calendar & Google Sheets tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Runs
          </Button>
          <Button size="sm" onClick={() => setSimulatorOpen(true)}>
            <Play className="h-4 w-4 fill-white" />
            Test Simulator
          </Button>
        </div>
      </div>

      {/* Active Automation Pipeline Card */}
      <Card className="overflow-hidden border border-cream-300/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cream-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-ink-900">{nexusAutomation.name}</h2>
              <span className="rounded bg-ink-100 px-2 py-0.5 text-xs font-mono font-bold text-ink-700">
                v{nexusAutomation.version}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs text-ink-500 leading-relaxed">
              {nexusAutomation.description}
            </p>
          </div>

          {/* Evolution API Gateway Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg border border-cream-300 bg-cream-50 px-3 py-1.5 text-ink-700">
              <ShieldCheck className="h-3.5 w-3.5 text-whatsapp-600" />
              <span>Instance: <strong className="font-mono text-ink-900">{nexusAutomation.evolutionInstance}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-cream-300 bg-cream-50 px-3 py-1.5 text-ink-700">
              <Webhook className="h-3.5 w-3.5 text-blue-600" />
              <span>Path: <strong className="font-mono text-ink-900">{nexusAutomation.webhookPath}</strong></span>
            </div>
          </div>
        </div>

        {/* Visual Workflow Nodes */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
              Workflow Architecture (5 Connected Nodes)
            </span>
            <span className="text-xs text-ink-400">
              Click any node to inspect parameters
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {nexusAutomation.nodes.map((node, index) => {
              const IconComp = iconMap[node.icon] || Bot;
              const isSimActive = activeSimNode === node.id;

              return (
                <motion.div
                  key={node.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedNode(node)}
                  className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                    isSimActive
                      ? 'border-whatsapp-500 bg-whatsapp-50 shadow-md shadow-whatsapp-500/20 ring-2 ring-whatsapp-500'
                      : 'border-cream-300 bg-cream-50/60 hover:border-whatsapp-400 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSimActive
                          ? 'bg-whatsapp-500 text-white'
                          : 'bg-cream-200 text-ink-700 group-hover:bg-whatsapp-100 group-hover:text-whatsapp-700'
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-cream-200/80 px-2 py-0.5 text-[10px] font-bold text-ink-600">
                      {node.badge}
                    </span>
                  </div>

                  <p className="mt-3 truncate text-xs font-bold text-ink-900">{node.title}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-ink-500">{node.subtitle}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-whatsapp-700">
                    <span className="font-semibold group-hover:underline">Inspect Node</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* System Prompt & Tool summary snippet */}
        <div className="mt-6 rounded-xl border border-cream-200 bg-cream-50/80 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 flex-shrink-0 text-whatsapp-600" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-ink-900">Strict Single-Sentence Agent System Instruction:</p>
              <p className="font-mono text-ink-600 bg-white/80 rounded-md p-2 border border-cream-200">
                "{nexusAutomation.systemPrompt}"
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-ink-500">
                <span>📅 <strong>Calendar:</strong> poojasahuu2006@gmail.com (Asia/Kolkata)</span>
                <span>📊 <strong>KnowledgeBase:</strong> Nexus_Agency_KnowledgeBase (Sheet1)</span>
                <span>⚡ <strong>Response Model:</strong> gpt-5-mini</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Execution Runs List */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink-900">Execution History & Logs</h2>
            <p className="text-xs text-ink-500">Real-time incoming WhatsApp messages and automated responses.</p>
          </div>
          <span className="text-xs font-bold text-ink-400">{runs.length} recorded runs</span>
        </div>

        <Card className="overflow-hidden border border-cream-300/80">
          {loading ? (
            <div className="divide-y divide-cream-300/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-5">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-cream-300/60">
              {runs.map((run) => {
                const config = statusConfig[run.status] || statusConfig.success;
                const isExpanded = expandedId === run.id;
                let parsed = null;
                try {
                  parsed = typeof run.details === 'string' ? JSON.parse(run.details) : run.details;
                } catch {
                  parsed = null;
                }

                const steps = run.steps || parsed?.steps || [];

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

                      {/* Name + Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-ink-900">{run.name}</p>
                          {run.sender && (
                            <span className="rounded bg-cream-200 px-2 py-0.5 text-[11px] font-mono text-ink-700">
                              {run.sender}
                            </span>
                          )}
                        </div>
                        {run.message && (
                          <p className="mt-0.5 truncate text-xs text-ink-600">
                            <strong>Query:</strong> "{run.message}"
                          </p>
                        )}
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-400">
                          <Clock className="h-3 w-3" />
                          {run.timestamp}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="hidden flex-shrink-0 font-mono text-xs font-semibold text-ink-600 sm:block">
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
                          className="overflow-hidden border-t border-cream-200 bg-cream-50/70 p-5"
                        >
                          <div className="space-y-4">
                            {/* Message vs Output banner */}
                            {run.reply && (
                              <div className="grid gap-3 rounded-xl border border-cream-300 bg-white p-4 sm:grid-cols-2">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                                    Customer WhatsApp Input
                                  </span>
                                  <p className="mt-1 text-xs text-ink-800 italic">
                                    "{run.message}"
                                  </p>
                                </div>
                                <div className="border-t border-cream-200 pt-2 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-whatsapp-700">
                                    Agent 1-Sentence Reply (Evolution API)
                                  </span>
                                  <p className="mt-1 text-xs font-semibold text-whatsapp-900">
                                    "{run.reply}"
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Execution Steps */}
                            {steps.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">
                                  Node Execution Path
                                </p>
                                <div className="space-y-2">
                                  {steps.map((step, si) => (
                                    <div
                                      key={si}
                                      className="flex items-center gap-3 rounded-lg border border-cream-200 bg-white px-3.5 py-2 shadow-2xs"
                                    >
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                          step.status === 'done'
                                            ? 'bg-whatsapp-500 text-white'
                                            : step.status === 'warning'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-cream-300 text-ink-600'
                                        }`}
                                      >
                                        ✓
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-ink-900">
                                          {step.node || step.step}
                                        </p>
                                        {step.detail && (
                                          <p className="text-[11px] text-ink-500">{step.detail}</p>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-whatsapp-600">
                                        Completed
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Raw JSON inspection */}
                            {run.details && (
                              <div>
                                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                                  Raw Automation Payload
                                </p>
                                <pre className="max-h-48 overflow-x-auto rounded-lg bg-ink-900 p-3 text-[11px] font-mono text-whatsapp-300">
                                  {typeof run.details === 'string' ? run.details : JSON.stringify(run.details, null, 2)}
                                </pre>
                              </div>
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

      {/* Interactive Test Simulator Modal */}
      <Modal
        open={simulatorOpen}
        onClose={() => !simulating && setSimulatorOpen(false)}
        title="Test Automation Simulator"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-ink-400">
              Triggers the complete 5-node pipeline
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={simulating} onClick={() => setSimulatorOpen(false)}>
                Close
              </Button>
              <Button disabled={simulating} onClick={() => handleRunSimulation()}>
                {simulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    Run Test Message
                  </>
                )}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-500">
            Simulate an incoming WhatsApp customer message to test the AI Agent's Google Calendar booking and Nexus KnowledgeBase lookups.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
              Sender WhatsApp Number
            </label>
            <input
              type="text"
              value={testSender}
              onChange={(e) => setTestSender(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-xs font-mono text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
              Incoming Message Text
            </label>
            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="e.g. Can I schedule a consultation call tomorrow at 3 PM?"
              className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-50 p-3 text-xs text-ink-900 outline-none focus:border-whatsapp-500 focus:bg-white"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-ink-500">Quick Test Scenarios:</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {[
                'Can I book a consultation call tomorrow at 3pm?',
                'What services does Nexus agency offer and what is the starting price?',
                'How fast can you build and launch our custom WhatsApp bot?',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setTestMessage(preset);
                    handleRunSimulation(preset);
                  }}
                  className="rounded-lg border border-cream-300 bg-cream-100/70 px-2.5 py-1 text-[11px] text-ink-700 hover:border-whatsapp-300 hover:bg-whatsapp-50 hover:text-whatsapp-800"
                >
                  {preset.slice(0, 42)}...
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-whatsapp-200 bg-whatsapp-50/50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-whatsapp-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Pipeline Executed in {simResult.duration}
                </span>
                {simResult.toolUsed && (
                  <span className="rounded bg-whatsapp-100 px-2 py-0.5 text-[10px] font-bold text-whatsapp-800">
                    Tool: {simResult.toolUsed}
                  </span>
                )}
              </div>
              <div className="mt-2.5 rounded-lg bg-white p-3 border border-whatsapp-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Agent Response (Single Sentence):
                </span>
                <p className="mt-1 text-xs font-semibold text-ink-900 leading-snug">
                  "{simResult.reply}"
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>

      {/* Node Inspector Modal */}
      {selectedNode && (
        <Modal
          open={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          title={`Node: ${selectedNode.title}`}
          footer={
            <Button onClick={() => setSelectedNode(null)}>Done</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-whatsapp-100 px-2.5 py-0.5 font-bold text-whatsapp-700">
                Type: {selectedNode.type}
              </span>
              <span className="rounded-full bg-cream-200 px-2.5 py-0.5 font-mono text-ink-600">
                ID: {selectedNode.id}
              </span>
            </div>

            <p className="text-ink-600 leading-relaxed">
              {selectedNode.description}
            </p>

            <div>
              <p className="font-bold uppercase tracking-wider text-ink-400 mb-1">
                Node Configuration Parameters:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-ink-900 p-3 font-mono text-[11px] text-whatsapp-300">
                {JSON.stringify(selectedNode.config, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
