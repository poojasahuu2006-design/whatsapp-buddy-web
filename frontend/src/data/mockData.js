export const conversations = [
  { id: '1', name: 'Aarav Patel', initials: 'AP', color: 'green', lastMessage: 'Can I schedule a consultation call tomorrow at 4 PM?', timestamp: '2 min ago', unread: 1 },
  { id: '2', name: 'Sara Khan', initials: 'SK', color: 'purple', lastMessage: 'What services does Nexus agency provide and what is the starting price?', timestamp: '14 min ago', unread: 0 },
  { id: '3', name: 'Rohan Mehta', initials: 'RM', color: 'blue', lastMessage: 'Thanks! The Google Calendar invite just popped up on my phone.', timestamp: '45 min ago', unread: 0 },
  { id: '4', name: 'Ananya Iyer', initials: 'AI', color: 'pink', lastMessage: 'Does your starter pack include custom CRM integration?', timestamp: '1 hr ago', unread: 0 },
  { id: '5', name: 'Vikram Singh', initials: 'VS', color: 'orange', lastMessage: 'Perfect, see you on tomorrow\'s strategy call!', timestamp: '3 hr ago', unread: 0 },
];

export const stats = [
  {
    label: 'Messages Today',
    value: '1,428',
    change: 14.8,
    sparkline: [30, 45, 38, 52, 48, 65, 58, 72, 68, 80],
  },
  {
    label: 'Active Conversations',
    value: '52',
    change: 9.4,
    sparkline: [12, 15, 18, 14, 22, 28, 25, 30, 35, 52],
  },
  {
    label: 'Avg Response Time',
    value: '1.1s',
    change: -18.2,
    sparkline: [80, 72, 68, 60, 55, 50, 45, 42, 38, 32],
  },
  {
    label: 'Uptime',
    value: '100%',
    change: 0.1,
    sparkline: [99, 99, 100, 99, 100, 100, 100, 100, 100, 100],
  },
];

export const nexusAutomation = {
  id: 'v6xg1VjqDrSRFyzH',
  name: 'Whatapp_Agent',
  status: 'active',
  version: '2.1',
  description: 'Autonomous WhatsApp AI Agent for Nexus Agency with real-time Google Calendar consultation scheduling and Google Sheets knowledge base lookup.',
  evolutionEndpoint: 'https://cst-evolution-api-da141464-620b10de.cloud-station.app',
  evolutionInstance: 'cs-cst-evolution-api-da141464',
  webhookPath: '/whatappbuddy',
  systemPrompt: 'You are the official AI assistant for Nexus Agency. Reply strictly in ONE concise, punchy sentence based on Nexus services ($499+ bot, $999+ web app, 5-14 days delivery, 30-day warranty). For consultations, schedule a 30-min discovery call on Google Calendar.',


  nodes: [
    {
      id: 'node-webhook',
      type: 'webhook',
      title: 'Webhook',
      subtitle: 'POST /whatappbuddy',
      icon: 'Webhook',
      badge: 'Trigger',
      color: 'blue',
      description: 'Receives real-time incoming WhatsApp messages from Evolution API gateway.',
      config: {
        method: 'POST',
        path: 'whatappbuddy',
        webhookId: 'd5c1e552-1dbe-4e7e-9a46-e2127548a251'
      }
    },
    {
      id: 'node-if',
      type: 'filter',
      title: 'Filter (fromMe)',
      subtitle: 'Condition: fromMe === false',
      icon: 'GitFork',
      badge: 'Logic',
      color: 'amber',
      description: 'Ignores messages sent by the agent itself, passing only incoming customer messages.',
      config: {
        condition: '$json.body.data.key.fromMe == false',
        trueBranch: 'AI Agent',
        falseBranch: 'No Operation (drop)'
      }
    },
    {
      id: 'node-agent',
      type: 'agent',
      title: 'AI Agent (LangChain)',
      subtitle: 'Model: gpt-5-mini',
      icon: 'Bot',
      badge: 'Reasoning',
      color: 'purple',
      description: 'Answers customer questions in crisp 1-sentence replies and autonomously calls connected tools.',
      config: {
        model: 'gpt-5-mini',
        systemMessage: 'You are a helpful assistant you will reply to the user query in the smartest possible way but in one sentence Dont extend the sentence',
        inputField: 'conversation || extendedTextMessage.text'
      }
    },
    {
      id: 'node-calendar',
      type: 'tool',
      title: 'Google Calendar Tool',
      subtitle: 'poojasahuu2006@gmail.com',
      icon: 'Calendar',
      badge: 'AI Tool',
      color: 'emerald',
      description: 'Schedules consultation calls for Nexus agency with start/end time in Asia/Kolkata timezone.',
      config: {
        calendar: 'poojasahuu2006@gmail.com',
        timezone: 'Asia/Kolkata',
        action: 'Create consultation event'
      }
    },
    {
      id: 'node-sheets',
      type: 'tool',
      title: 'Nexus KnowledgeBase (Sheets)',
      subtitle: 'Nexus_Agency_KnowledgeBase',
      icon: 'Database',
      badge: 'AI Tool',
      color: 'teal',
      description: 'Looks up Nexus agency services, pricing packages ($499 - $3,499), delivery timelines, and FAQs.',
      config: {
        documentId: '1qWtucHwvHVXJAfzRPUnz12kQNX0EWFmkA9delB0I4LE',
        sheet: 'Sheet1'
      }
    },
    {
      id: 'node-http',
      type: 'action',
      title: 'Evolution API (SendText)',
      subtitle: 'POST /message/sendText/cs-cst-...',
      icon: 'Send',
      badge: 'Action',
      color: 'whatsapp',
      description: 'Dispatches the 1-sentence AI response directly to the customer\'s WhatsApp chat.',
      config: {
        endpoint: 'https://cst-evolution-api-da141464-620b10de.cloud-station.app',
        instance: 'cs-cst-evolution-api-da141464',
        auth: 'API Key (header)'
      }
    }
  ]
};

export const personas = [
  {
    id: 'nexus-consultant',
    title: 'Nexus Agency Consultant',
    description: 'Autonomous agency representative. Answers services, pricing, and books Google Calendar consultations in 1 sentence.',
    icon: 'Briefcase',
    isDefault: true,
    systemPrompt: 'You are a helpful assistant you will reply to the user query in the smartest possible way but in one sentence Dont extend the sentence',
    tools: ['Google Calendar (poojasahuu2006@gmail.com)', 'Nexus KnowledgeBase (Google Sheets)'],
    model: 'gpt-5-mini',
  },
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

export const automationRuns = [
  {
    id: 'run-101',
    name: 'Whatapp_Agent: Consultation Booking',
    status: 'success',
    timestamp: 'Today, 12:53 AM',
    duration: '1.18s',
    sender: '+91 98765 43210',
    message: 'Can I book a consultation call tomorrow at 3pm?',
    reply: 'Your consultation meeting with Nexus agency has been booked for tomorrow on Google Calendar at poojasahuu2006@gmail.com.',
    details: JSON.stringify(
      {
        workflow: 'Whatapp_Agent',
        trigger: 'Evolution API Webhook (/whatappbuddy)',
        sender: '919876543210@s.whatsapp.net',
        condition: 'fromMe == false (passed)',
        toolInvoked: 'Google Calendar Tool (poojasahuu2006@gmail.com, Asia/Kolkata)',
        promptConstraint: 'Strict 1-sentence output enforced',
        steps: [
          { step: 'Receive Webhook payload from Evolution API', status: 'done' },
          { step: 'Verify fromMe === false', status: 'done' },
          { step: 'AI Agent invokes Google Calendar booking tool', status: 'done' },
          { step: 'Send 1-sentence WhatsApp reply via Evolution API', status: 'done' },
        ],
        output: 'Your consultation meeting with Nexus agency has been booked for tomorrow on Google Calendar at poojasahuu2006@gmail.com.'
      },
      null,
      2,
    ),
  },
  {
    id: 'run-102',
    name: 'Whatapp_Agent: Services & Pricing Inquiry',
    status: 'success',
    timestamp: 'Today, 12:52 AM',
    duration: '1.33s',
    sender: '+91 98765 43210',
    message: 'What services does Nexus agency provide and how much is it?',
    reply: 'Nexus agency builds WhatsApp AI automations, web applications, and digital systems starting at $499 with 7 to 14-day turnaround.',
    details: JSON.stringify(
      {
        workflow: 'Whatapp_Agent',
        trigger: 'Evolution API Webhook (/whatappbuddy)',
        sender: '919876543210@s.whatsapp.net',
        condition: 'fromMe == false (passed)',
        toolInvoked: 'Google Sheets Tool (Nexus_Agency_KnowledgeBase)',
        promptConstraint: 'Strict 1-sentence output enforced',
        steps: [
          { step: 'Receive Webhook payload from Evolution API', status: 'done' },
          { step: 'Verify fromMe === false', status: 'done' },
          { step: 'Query Nexus KnowledgeBase sheet (Sheet1)', status: 'done' },
          { step: 'Send 1-sentence WhatsApp reply via Evolution API', status: 'done' },
        ],
        output: 'Nexus agency builds WhatsApp AI automations, web applications, and digital systems starting at $499 with 7 to 14-day turnaround.'
      },
      null,
      2,
    ),
  },
  {
    id: 'run-103',
    name: 'Whatapp_Agent: Outbound Message Filter',
    status: 'success',
    timestamp: 'Today, 12:48 AM',
    duration: '0.04s',
    sender: '+91 98765 43210 (Bot Self)',
    message: 'Confirming your consultation calendar invite.',
    reply: '[Skipped - fromMe is true]',
    details: JSON.stringify(
      {
        workflow: 'Whatapp_Agent',
        trigger: 'Evolution API Webhook (/whatappbuddy)',
        sender: 'cs-cst-evolution-api-da141464',
        condition: 'fromMe == true (filtered)',
        steps: [
          { step: 'Receive Webhook payload', status: 'done' },
          { step: 'Evaluate fromMe condition', status: 'done' },
          { step: 'Branch to "No Operation, do nothing"', status: 'done' },
        ],
        action: 'No operation performed to prevent infinite loop.'
      },
      null,
      2,
    ),
  },
  {
    id: 'run-104',
    name: 'Whatapp_Agent: Delivery Timelines FAQ',
    status: 'success',
    timestamp: 'Yesterday, 11:20 PM',
    duration: '0.92s',
    sender: '+1 555 014 2893',
    message: 'How fast can Nexus deploy our WhatsApp AI agent?',
    reply: 'Nexus agency delivers and deploys completed WhatsApp AI automations within 7 to 14 business days.',
    details: JSON.stringify(
      {
        workflow: 'Whatapp_Agent',
        trigger: 'Evolution API Webhook (/whatappbuddy)',
        sender: '15550142893@s.whatsapp.net',
        condition: 'fromMe == false (passed)',
        toolInvoked: 'Google Sheets Tool (Nexus_Agency_KnowledgeBase)',
        steps: [
          { step: 'Receive Webhook payload', status: 'done' },
          { step: 'Evaluate condition fromMe == false', status: 'done' },
          { step: 'Extract timeline from KnowledgeBase Sheet', status: 'done' },
          { step: 'Send 1-sentence WhatsApp reply via Evolution API', status: 'done' },
        ]
      },
      null,
      2,
    ),
  }
];

export const plans = [
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
