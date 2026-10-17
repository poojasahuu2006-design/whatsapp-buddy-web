# WhatsApp Buddy Backend (Node.js & Express)

Complete **Node.js** & **Express** backend application powering the WhatsApp Buddy automation engine, Evolution API gateway, live QR code scanning, and AI Agent response execution.

---

## 📁 Architecture & Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── config.js              # Environment variables & constants
│   ├── controllers/
│   │   ├── authController.js       # Live QR code & connection state handler
│   │   ├── chatController.js       # Contacts, message history, direct send & AI reply
│   │   ├── webhookController.js    # Incoming Evolution API / n8n webhook receiver
│   │   └── automationController.js # Test pipeline simulator & run logs
│   ├── routes/
│   │   ├── index.js               # Primary Express router
│   │   ├── authRoutes.js          # /api/qr, /api/connection-state
│   │   ├── chatRoutes.js          # /api/contacts, /api/chats/:jid/messages, /api/chats/send, /api/chats/ai-reply
│   │   ├── webhookRoutes.js       # /api/whatappbuddy
│   │   └── automationRoutes.js    # /api/automations/simulate, /api/automations/runs
│   ├── services/
│   │   ├── evolutionService.js    # Evolution API HTTP client (Axios)
│   │   └── aiAgentService.js      # LangChain AI agent with Calendar & Sheets tools
│   └── app.js                     # Express application configuration & middlewares
├── server.js                      # Main HTTP server listener (Node.js entry point)
├── package.json                   # Node.js dependencies & scripts
├── .env                           # Environment configuration
└── .env.example
```

---

## 🛠️ Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js (`express@^4.21.0`)
- **HTTP Client**: Axios (`axios@^1.7.7`)
- **Middleware**: CORS (`cors@^2.8.5`), Body Parsers (`express.json()`, `express.urlencoded()`)
- **Config**: Dotenv (`dotenv@^16.4.5`)

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure `.env`
Ensure your `.env` file contains:
```ini
PORT=5000
EVOLUTION_API_URL=https://cst-evolution-api-da141464-620b10de.cloud-station.app
EVOLUTION_INSTANCE=cs-cst-evolution-api-da141464
EVOLUTION_API_KEY=61C1EB49-2704-4D2C-B24B-A63A6F659F07
CALENDAR_EMAIL=poojasahuu2006@gmail.com
TIMEZONE=Asia/Kolkata
```

### 3. Start the Server
- **Development (with hot reload)**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

---

## 📡 API Endpoints

### 🔐 Authentication & QR Code
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/qr` | Fetches the live base64 QR code and connection state from Evolution API |
| `GET` | `/api/connection-state` | Returns the current state (`open`, `close`, `connecting`) |

### 💬 Contacts & Chats
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | Returns all synced WhatsApp contacts & active chats |
| `GET` | `/api/chats/:jid/messages` | Returns message history for a specific chat JID |
| `POST` | `/api/chats/send` | Sends a direct message `{ number, text }` via Evolution API |
| `POST` | `/api/chats/ai-reply` | Uses AI Agent to generate a 1-sentence reply with tools and sends it to WhatsApp |

### ⚡ Webhook Receiver (Matches n8n path)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/whatappbuddy` | Receives incoming messages, checks `fromMe === false`, runs AI Agent, dispatches 1-sentence reply |
| `POST` | `/whatappbuddy` | Direct path alias matching exact n8n webhook configuration |

### 🧪 Automations & Simulator
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/automations/simulate` | Simulates an incoming query and returns step-by-step tool execution logs |
| `GET` | `/api/automations/runs` | Returns recent execution history |
| `GET` | `/api/health` | Server health check |
