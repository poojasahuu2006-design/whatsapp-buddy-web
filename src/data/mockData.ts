export interface Conversation {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export const conversations: Conversation[] = [
  { id: '1', name: 'Amara Okafor', initials: 'AO', color: 'green', lastMessage: 'Perfect, I\'ll take 2 units. Can you ship to Lagos?', timestamp: '2 min ago', unread: 3 },
  { id: '2', name: 'Diego Martinez', initials: 'DM', color: 'orange', lastMessage: 'Thanks for the quick reply! The order looks good.', timestamp: '8 min ago', unread: 0 },
  { id: '3', name: 'Priya Sharma', initials: 'PS', color: 'purple', lastMessage: 'Hi, is the premium plan still on sale?', timestamp: '15 min ago', unread: 1 },
  { id: '4', name: 'James Wilson', initials: 'JW', color: 'blue', lastMessage: 'Got it, I\'ll check the tracking link now.', timestamp: '23 min ago', unread: 0 },
  { id: '5', name: 'Fatima Hassan', initials: 'FH', color: 'pink', lastMessage: 'Can I get a refund for order #4821?', timestamp: '1 hr ago', unread: 2 },
  { id: '6', name: 'Chen Wei', initials: 'CW', color: 'teal', lastMessage: 'The new features look amazing! When does it launch?', timestamp: '2 hr ago', unread: 0 },
  { id: '7', name: 'Sofia Rossi', initials: 'SR', color: 'dark', lastMessage: 'You\'ve been very helpful, thank you so much!', timestamp: '3 hr ago', unread: 0 },
];

export interface StatCard {
  label: string;
  value: string;
  change: number;
  sparkline: number[];
}

export const stats: StatCard[] = [
  {
    label: 'Messages Today',
    value: '1,284',
    change: 12.5,
    sparkline: [30, 45, 38, 52, 48, 65, 58, 72, 68, 80],
  },
  {
    label: 'Active Conversations',
    value: '47',
    change: 8.2,
    sparkline: [12, 15, 18, 14, 22, 28, 25, 30, 35, 47],
  },
  {
    label: 'Avg Response Time',
    value: '1.2s',
    change: -15.3,
    sparkline: [80, 72, 68, 60, 55, 50, 45, 42, 38, 35],
  },
  {
    label: 'Uptime',
    value: '99.9%',
    change: 0.1,
    sparkline: [99, 99, 100, 99, 100, 100, 99, 100, 100, 100],
  },
];

export interface Persona {
  id: string;
  title: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

export const personas: Persona[] = [
  {
    id: 'study-buddy',
    title: 'Study Buddy',
    description: 'Helps students with study schedules, flashcards, and quiz prep.',
    icon: 'GraduationCap',
    systemPrompt: 'You are a helpful study companion. You create study schedules, generate flashcards, and quiz students on their material. Be encouraging and use examples.',
  },
  {
    id: 'customer-support',
    title: 'Customer Support',
    description: 'Handles product questions, order issues, and refunds professionally.',
    icon: 'Headphones',
    systemPrompt: 'You are a professional customer support agent. You handle product inquiries, order issues, and refund requests. Always be polite, empathetic, and solution-oriented.',
  },
  {
    id: 'personal-assistant',
    title: 'Personal Assistant',
    description: 'Manages reminders, schedules, and daily tasks for busy professionals.',
    icon: 'Briefcase',
    systemPrompt: 'You are a personal assistant. You help manage schedules, set reminders, and organize daily tasks. Be concise, proactive, and organized.',
  },
];

export interface AutomationRun {
  id: string;
  name: string;
  status: 'success' | 'error' | 'running';
  timestamp: string;
  duration: string;
  details: string;
}

export const automationRuns: AutomationRun[] = [
  {
    id: '1',
    name: 'Welcome Message Campaign',
    status: 'success',
    timestamp: '2026-09-19 09:42 AM',
    duration: '2.3s',
    details: JSON.stringify(
      {
        steps: [
          { step: 'Fetch target audience', status: 'done' },
          { step: 'Render message template', status: 'done' },
          { step: 'Send via WhatsApp API', status: 'done' },
          { step: 'Log delivery receipts', status: 'done' },
        ],
        recipients: 248,
        delivered: 246,
        failed: 2,
      },
      null,
      2,
    ),
  },
  {
    id: '2',
    name: 'Abandoned Cart Follow-up',
    status: 'success',
    timestamp: '2026-09-19 08:15 AM',
    duration: '1.8s',
    details: JSON.stringify(
      {
        steps: [
          { step: 'Query cart events (last 24h)', status: 'done' },
          { step: 'Filter eligible users', status: 'done' },
          { step: 'Send personalized reminder', status: 'done' },
        ],
        recipients: 87,
        delivered: 87,
        failed: 0,
      },
      null,
      2,
    ),
  },
  {
    id: '3',
    name: 'Daily Summary Report',
    status: 'error',
    timestamp: '2026-09-19 07:00 AM',
    duration: '0.5s',
    details: JSON.stringify(
      {
        error: 'Database connection timeout',
        steps: [
          { step: 'Connect to analytics DB', status: 'error' },
          { step: 'Aggregate daily metrics', status: 'skipped' },
          { step: 'Generate report PDF', status: 'skipped' },
          { step: 'Email to admins', status: 'skipped' },
        ],
      },
      null,
      2,
    ),
  },
  {
    id: '4',
    name: 'Birthday Greeting Blast',
    status: 'running',
    timestamp: '2026-09-19 10:30 AM',
    duration: 'running...',
    details: JSON.stringify(
      {
        steps: [
          { step: 'Fetch today\'s birthdays', status: 'done' },
          { step: 'Render greeting cards', status: 'running' },
          { step: 'Send via WhatsApp API', status: 'pending' },
        ],
        recipients: 34,
        delivered: 12,
        failed: 0,
      },
      null,
      2,
    ),
  },
  {
    id: '5',
    name: 'Appointment Reminder',
    status: 'success',
    timestamp: '2026-09-18 06:00 PM',
    duration: '3.1s',
    details: JSON.stringify(
      {
        steps: [
          { step: 'Query upcoming appointments', status: 'done' },
          { step: 'Send reminder messages', status: 'done' },
          { step: 'Update appointment flags', status: 'done' },
        ],
        recipients: 56,
        delivered: 56,
        failed: 0,
      },
      null,
      2,
    ),
  },
];

export interface PlanTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const plans: PlanTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['2,000 messages/mo', '1 WhatsApp number', 'Basic AI replies', '7-day analytics'],
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    features: ['10,000 messages/mo', '2 WhatsApp numbers', 'Advanced AI agent', 'Full analytics', 'Custom personas', 'Webhooks'],
    highlighted: true,
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Business',
    price: '$99',
    period: '/mo',
    features: ['50,000 messages/mo', '5 WhatsApp numbers', 'Priority AI processing', 'Team seats (up to 10)', 'API access', 'Dedicated support'],
    cta: 'Upgrade to Business',
  },
];
