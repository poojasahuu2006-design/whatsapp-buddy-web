/**
 * Structured Knowledge Base for Nexus Agency AI Assistant.
 * Designed for optimal retrieval by LLMs (OpenAI, Gemini, LangChain, n8n)
 * and intelligent offline semantic fallback.
 */

export const KNOWLEDGE_BASE_ENTRIES = [
  {
    id: 'kb-00',
    category: 'Greetings',
    topic: 'Greetings & Welcome',
    triggers: [
      'hi', 'hii', 'hiii', 'hello', 'hey', 'namaste', 'pranam',
      'good morning', 'good afternoon', 'good evening', 'sup',
      'kaise ho', 'kese ho', 'hello nexus', 'hi nexus'
    ],
    whatsappResponse: 'Hello! Welcome to Nexus Agency. We create autonomous WhatsApp AI agents, web apps, and business automations. How can we help you today?',
    detailedContext: 'Nexus Agency welcome greeting. We provide autonomous WhatsApp AI bots, custom web apps, and intelligent business workflows.',
    keywords: ['hi', 'hii', 'hello', 'hey', 'namaste', 'welcome', 'greetings', 'start']
  },
  {
    id: 'kb-01',
    category: 'Agency Overview',
    topic: 'About Nexus Agency',
    triggers: [
      'who are you', 'what is nexus', 'what is nexus agency', 'about nexus', 'about your company', 
      'aap kaun ho', 'nexus kya hai', 'company ke baare me batao', 'introduce yourself',
      'tell me about nexus', 'nexus agency overview'
    ],
    whatsappResponse: 'Nexus Agency is an elite AI automation and software development studio that builds autonomous WhatsApp AI agents, custom web apps, and intelligent business workflows.',
    detailedContext: 'Nexus Agency specializes in end-to-end digital transformation for modern businesses. We develop custom AI agents for customer support and lead generation, full-stack web and mobile applications, CRM automations, and API integrations that run 24/7.',
    keywords: ['nexus', 'agency', 'company', 'about', 'who', 'kaun', 'intro', 'overview']
  },
  {
    id: 'kb-02',
    category: 'Services',
    topic: 'Services Offered',
    triggers: [
      'what services do you offer', 'what do you do', 'services', 'offerings',
      'kya kya service dete ho', 'kya kaam karte ho', 'services list', 'products',
      'what are your services', 'features kya hain', 'what can you build'
    ],
    whatsappResponse: 'We provide autonomous WhatsApp AI bots, custom full-stack web apps, CRM automations, and AI-powered booking systems tailored to scale your business operations.',
    detailedContext: 'Core service offerings: 1. WhatsApp AI Customer Support & Sales Agents (with human handover, calendar booking, document search). 2. Custom Web & Mobile Applications (React, Next.js, Node.js, Python). 3. Business Workflow Automation (n8n, Zapier, Make, custom APIs). 4. AI Calendar & Appointment Scheduling systems.',
    keywords: ['service', 'services', 'offering', 'kaam', 'features', 'build', 'create', 'develop', 'solutions']
  },
  {
    id: 'kb-03',
    category: 'Services',
    topic: 'WhatsApp AI Automation',
    triggers: [
      'whatsapp bot', 'whatsapp ai', 'whatsapp automation', 'whatsapp agent',
      'whatsapp bot kaise banaye', 'whatsapp automation chahiye', 'bot banana hai',
      'how does the whatsapp bot work', 'tell me about your whatsapp bot'
    ],
    whatsappResponse: 'Our WhatsApp AI bots automatically answer customer inquiries from your custom knowledge base, qualify leads, and book calendar meetings 24/7 in multiple languages.',
    detailedContext: 'Our WhatsApp automation integrates directly with official Cloud API or Evolution/Baileys, connects to Google Sheets, Google Docs, Notion, or internal databases, and features automatic appointment booking with Google Calendar.',
    keywords: ['whatsapp', 'bot', 'agent', 'automation', 'chat', 'leads', 'support']
  },
  {
    id: 'kb-04',
    category: 'Pricing',
    topic: 'Pricing Plans & Packages',
    triggers: [
      'what are your pricing packages', 'how much does a whatsapp ai bot cost',
      'what is the price for a custom web application', 'can you tell me your rates and fees',
      'price', 'pricing', 'cost', 'how much', 'charges', 'rate', 'fees',
      'kitna kharcha aayega', 'kitne paise lagenge', 'packages', 'kya price hai', 'rates',
      'pricing packages', 'pricing details'
    ],
    whatsappResponse: 'Our packages start at $499 (₹39,999) for standard WhatsApp AI automations, and $999 (₹79,999) for full-stack custom web applications with AI integration.',
    detailedContext: 'Pricing tiers: 1. Starter Tier ($499 / ₹39,999): Complete WhatsApp AI Agent with custom Knowledge Base and Google Calendar integration. 2. Growth Tier ($999 / ₹79,999): Full-stack custom Web App or SaaS dashboard with database, AI agent, and analytics. 3. Enterprise Tier ($1,999+ / ₹1,59,999+): Tailored multi-agent workflows, custom CRM, and dedicated SLA support.',
    keywords: ['price', 'pricing', 'cost', 'rate', 'charges', 'fees', 'paise', 'kharcha', 'package', 'plan', 'tier']
  },
  {
    id: 'kb-05',
    category: 'Pricing',
    topic: 'Discounts & Custom Quotes',
    triggers: [
      'discount', 'cheap', 'budget', 'bargain', 'custom quote', 'negotiate',
      'kam karo', 'discount milega', 'budget issue', 'best price', 'special price'
    ],
    whatsappResponse: 'We offer flexible phased milestones and tailored pricing based on your project scope; book a quick discovery call to discuss a package that fits your budget.',
    detailedContext: 'We provide structured payment plans (50% upfront, 50% on milestone delivery) and custom quotes for startups and non-profits.',
    keywords: ['discount', 'kam', 'negotiate', 'offer', 'quote', 'deal', 'budget']
  },
  {
    id: 'kb-06',
    category: 'Delivery',
    topic: 'Turnaround & Delivery Timeline',
    triggers: [
      'what is your delivery timeline for web applications', 'how long will it take to build a whatsapp bot',
      'how many days until our project goes live', 'what is the turnaround time for a custom automation',
      'timeline', 'turnaround', 'how long', 'delivery time', 'duration',
      'kitne din me ready hoga', 'kab tak banega', 'delivery kab tak hogi', 'how many days',
      'delivery timeline', 'project timeline'
    ],
    whatsappResponse: 'Standard WhatsApp AI automations are deployed in 5 to 7 business days, while full-stack custom web applications typically launch within 10 to 14 days.',
    detailedContext: 'Project development lifecycle: Day 1-2: Requirements & Architecture; Day 3-5: Core development & Knowledge Base embedding; Day 6-7: Testing & deployment; Day 8-14: Custom UI/web integration & QA.',
    keywords: ['timeline', 'turnaround', 'days', 'time', 'duration', 'kitne din', 'delivery', 'launch', 'ready']
  },
  {
    id: 'kb-07',
    category: 'Portfolio',
    topic: 'Past Work & Demos',
    triggers: [
      'can you show me some past work or portfolio examples', 'show me your portfolio',
      'portfolio', 'case studies', 'past work', 'demo', 'examples', 'previous clients',
      'kuch demo dikhao', 'past projects', 'sample', 'dikhao', 'case study', 'portfolio examples'
    ],
    whatsappResponse: 'We have built automated sales agents, clinic booking systems, and eCommerce assistants—let us know your industry and we will share a live interactive demo link.',
    detailedContext: 'Past successful deployments include: 1. Dental Clinic appointment bot booking 80+ patients/week. 2. Real estate lead qualification bot. 3. E-commerce WhatsApp concierge with order status tracking. 4. B2B SaaS onboarding bots.',
    keywords: ['portfolio', 'demo', 'sample', 'work', 'case', 'study', 'example', 'dikhao']
  },
  {
    id: 'kb-08',
    category: 'Booking',
    topic: 'Consultation & Meeting Booking',
    triggers: [
      'can we schedule a consultation call tomorrow at 4 pm', 'schedule a call', 'book meeting',
      'book call', 'schedule meeting', 'appointment', 'consultation', 'talk to founder',
      'baat karni hai', 'meeting karni hai', 'call schedule karo', 'slot chahiye', 'discovery call'
    ],
    whatsappResponse: 'You can book a free 30-minute discovery call directly on our Google Calendar by telling us your preferred date and time, or by clicking our calendar link.',
    detailedContext: 'Discovery calls are 30 minutes, conducted over Google Meet. The AI agent can automatically check availability and create events on poojasahuu2006@gmail.com in Asia/Kolkata timezone.',
    keywords: ['book', 'schedule', 'call', 'meeting', 'appointment', 'slot', 'milna', 'baat']
  },
  {
    id: 'kb-09',
    category: 'Technology',
    topic: 'Tech Stack & Integrations',
    triggers: [
      'tech stack', 'technology', 'tools used', 'which models', 'open source',
      'kaunsi technology use karte ho', 'integrations', 'api', 'what tech do you use'
    ],
    whatsappResponse: 'We build on top of OpenAI GPT-4o, Anthropic Claude, LangChain, Node.js, Next.js, and seamlessly integrate with Google Workspace, CRM, and WhatsApp APIs.',
    detailedContext: 'Backend: Node.js, Express, Python FastAPI, MongoDB, PostgreSQL. AI: OpenAI, LangChain, n8n, Embeddings, RAG. Frontend: React, Vite, TailwindCSS, Next.js. WhatsApp: Baileys, Evolution API, official WhatsApp Business Cloud API.',
    keywords: ['tech', 'technology', 'stack', 'model', 'openai', 'react', 'node', 'integration', 'tools']
  },
  {
    id: 'kb-10',
    category: 'Support',
    topic: 'Support, Warranty & Revisions',
    triggers: [
      'support', 'maintenance', 'revisions', 'bug fix', 'after delivery',
      'kharab hua toh', 'support milega kya', 'warranty', 'guarantee',
      'what happens after launch', 'free support'
    ],
    whatsappResponse: 'Every project includes 30 days of free post-launch maintenance, bug fixes, and revisions, with optional 24/7 managed support plans thereafter.',
    detailedContext: '30-day warranty covers any bugs, prompt tuning, API adjustments, and minor copy changes. Ongoing SLA retainers are available starting at $199/month.',
    keywords: ['support', 'maintenance', 'warranty', 'guarantee', 'revision', 'fix', 'help']
  },
  {
    id: 'kb-11',
    category: 'Process',
    topic: 'How to Get Started',
    triggers: [
      'how to start', 'process', 'how it works', 'steps', 'next steps',
      'kaise shuru kare', 'kaise kaam kare', 'start kaise kare', 'how do we begin'
    ],
    whatsappResponse: 'To get started, we conduct a quick 30-minute discovery call to map your requirements, provide a clear proposal, and start building within 24 hours of kickoff.',
    detailedContext: 'Step 1: Free 30-min discovery call. Step 2: Custom scope proposal & quote within 24 hours. Step 3: 50% deposit & development kickoff. Step 4: Preview, QA & live deployment. Step 5: 30-day post-launch support.',
    keywords: ['start', 'shuru', 'process', 'steps', 'kickoff', 'onboarding']
  }
];

/**
 * Smart matching algorithm to find the most accurate Knowledge Base entry
 * for any user query (English or Hinglish).
 */
export function findBestKnowledgeAnswer(userQuery) {
  if (!userQuery || typeof userQuery !== 'string') {
    return null;
  }

  const query = userQuery.toLowerCase().trim();
  const cleanQuery = query.replace(/[?!.,;:]/g, '').trim();
  const words = cleanQuery.split(/\s+/).filter(w => w.length > 1);

  let bestEntry = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE_ENTRIES) {
    let score = 0;

    // Direct trigger match
    for (const trigger of entry.triggers) {
      const t = trigger.toLowerCase().trim();
      if (cleanQuery === t) {
        score += 100; // Exact match
      } else if (cleanQuery.startsWith(t + ' ') || cleanQuery.endsWith(' ' + t) || cleanQuery.includes(' ' + t + ' ')) {
        score += 50; // Whole trigger phrase match
      } else if (cleanQuery.includes(t)) {
        score += 25;
      }
    }

    // Keyword hits
    for (const kw of entry.keywords) {
      const k = kw.toLowerCase().trim();
      if (cleanQuery === k || cleanQuery.includes(k)) {
        score += 8;
      }
    }

    // Word boundary matches in topic / category
    for (const word of words) {
      if (entry.topic.toLowerCase().includes(word)) score += 4;
      if (entry.category.toLowerCase().includes(word)) score += 3;
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  // Minimum threshold to prevent false positives
  if (highestScore >= 8 && bestEntry) {
    return {
      entry: bestEntry,
      score: highestScore,
      response: bestEntry.whatsappResponse
    };
  }

  return null;
}
