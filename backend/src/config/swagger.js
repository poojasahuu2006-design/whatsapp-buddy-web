export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'WhatsApp Buddy AI Engine & CRM API',
    version: '1.0.0',
    description: 'Comprehensive Interactive API Documentation for WhatsApp Buddy SaaS, Evolution API Gateway, and MongoDB Atlas CRM.',
    contact: {
      name: 'Nexus Agency Support',
      email: 'poojasahuu2006@gmail.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'WhatsApp Connection', description: 'Evolution API QR Code, Pairing & Socket State' },
    { name: 'Incoming Webhook', description: 'Evolution API message events & AI auto-responder' },
    { name: 'Contacts & Chats', description: 'Address book sync and WhatsApp messaging' },
    { name: 'Google Calendar', description: 'Consultation and meeting scheduling' },
    { name: 'MongoDB Database', description: 'Saved leads, customer profiles & chat history' },
    { name: 'Automations', description: 'Workflow simulations and live execution runs' }
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['WhatsApp Connection'],
        summary: 'Check API Server Health',
        responses: {
          200: { description: 'Server is healthy' }
        }
      }
    },
    '/api/connection-state': {
      get: {
        tags: ['WhatsApp Connection'],
        summary: 'Get Live WhatsApp Baileys Connection State',
        responses: {
          200: { description: 'Connection state returned (open / close)' }
        }
      }
    },
    '/api/qr': {
      get: {
        tags: ['WhatsApp Connection'],
        summary: 'Get Live WhatsApp QR Code Base64 Image',
        responses: {
          200: { description: 'Base64 QR code returned for scanning' }
        }
      }
    },
    '/api/contacts': {
      get: {
        tags: ['Contacts & Chats'],
        summary: 'Get All Synced WhatsApp Contacts & Chats',
        responses: {
          200: { description: 'List of all 1,160+ real phonebook contacts' }
        }
      }
    },
    '/api/whatappbuddy': {
      post: {
        tags: ['Incoming Webhook'],
        summary: 'Evolution API Incoming Message Webhook Receiver',
        description: 'Receives MESSAGES_UPSERT event, runs Nexus AI reasoning, and dispatches auto-reply.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  event: { type: 'string', example: 'messages.upsert' },
                  instance: { type: 'string', example: 'cs-cst-evolution-api-da141464' },
                  data: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'object',
                        properties: {
                          remoteJid: { type: 'string', example: '918766438685@s.whatsapp.net' },
                          fromMe: { type: 'boolean', example: false }
                        }
                      },
                      pushName: { type: 'string', example: 'Pooja Sahu' },
                      message: {
                        type: 'object',
                        properties: {
                          conversation: { type: 'string', example: 'What services does Nexus agency provide?' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Message processed and auto-reply dispatched' }
        }
      }
    },
    '/api/db/leads': {
      get: {
        tags: ['MongoDB Database'],
        summary: 'View All Saved WhatsApp Leads from MongoDB Atlas',
        responses: {
          200: { description: 'List of all customer profiles in MongoDB' }
        }
      }
    },
    '/api/db/logs': {
      get: {
        tags: ['MongoDB Database'],
        summary: 'View Complete Conversation Logs from MongoDB Atlas',
        responses: {
          200: { description: 'List of all messages and AI responses' }
        }
      }
    },
    '/api/calendar/events': {
      get: {
        tags: ['Google Calendar'],
        summary: 'Get Scheduled Discovery Calls & Events',
        responses: {
          200: { description: 'List of Google Calendar appointments' }
        }
      }
    },
    '/api/automations/runs': {
      get: {
        tags: ['Automations'],
        summary: 'Get Real-Time Workflow Execution History',
        responses: {
          200: { description: 'Timeline of recent webhook executions' }
        }
      }
    }
  }
};
