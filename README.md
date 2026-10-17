# 🤖 WhatsApp AI Buddy — Autonomous CRM & Automation SaaS

An autonomous WhatsApp AI Agent and CRM platform that connects real WhatsApp numbers to automated AI responses, Google Calendar appointment booking, and persistent cloud storage in MongoDB Atlas.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js (REST API & Webhook Receiver)
- **Database:** MongoDB Atlas (Cloud CRM), PostgreSQL 16 (Evolution store)
- **WhatsApp Gateway:** Evolution API v2.3.7 (Baileys WebSocket Engine)
- **Integrations:** Google Calendar API, OpenAPI 3.0 Swagger UI

---

## 🏗️ Architecture Flow

```
WhatsApp User ──► Evolution API (Port 8080) ──► Express Webhook (/api/whatappbuddy)
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           ▼                                                       ▼
            Nexus AI Intent & Calendar Booking                       MongoDB Atlas Persistence
        (Auto-Reply Sent back to WhatsApp in <300ms)                (Saved Leads & Message Logs)
```

---

## ✨ Core Features

1. **Sub-Second AI Auto-Replies:** Responds to greetings, pricing, and services instantly on behalf of Nexus Agency.
2. **Google Calendar Auto-Booking:** Detects meeting requests (e.g., *"tomorrow at 5pm"*) and schedules events on Google Calendar (`poojasahuu2006@gmail.com`) with instant confirmation.
3. **Persistent Cloud CRM (MongoDB Atlas):** Automatically saves customer profiles (`leads`), conversation history (`messagelogs`), and appointment records.
4. **1,160+ Contacts Synced:** Merges and displays phonebook contacts, groups, and avatars on the dashboard.
5. **Anti-Spam Shield:** Automatically filters out group messages (`@g.us`) and self-messages (`fromMe`) to prevent spam and infinite loops.
6. **Interactive Swagger Documentation:** Explore and test all APIs live at `http://localhost:5000/api-docs`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | Server heartbeat status |
| `GET` | `/api/connection-state` | WhatsApp Baileys socket status (`open`/`close`) |
| `GET` | `/api/qr` | Get live QR code for WhatsApp linking |
| `GET` | `/api/contacts` | Sync 1,160+ WhatsApp contacts and chats |
| `POST` | `/api/whatappbuddy` | Inbound WhatsApp webhook receiver |
| `GET` | `/api/db/leads` | View all customer leads stored in MongoDB |
| `GET` | `/api/db/logs` | View all chat history logs stored in MongoDB |
| `GET` | `/api/calendar/events` | List scheduled Google Calendar meetings |

---

## 🚀 Quickstart Guide

### 1. Start WhatsApp Gateway (Docker)
```bash
docker compose -f docker-compose.evolution.yml up -d
```

### 2. Configure Environment (`backend/.env`)
```env
PORT=5000
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE=cs-cst-evolution-api-da141464
EVOLUTION_API_KEY=61C1EB49-2704-4D2C-B24B-A63A6F659F07
CALENDAR_EMAIL=poojasahuu2006@gmail.com
TIMEZONE=Asia/Kolkata
MONGODB_URI=mongodb+srv://poojasahuu2006_db_user:<password>@cluster0.kpjsxdz.mongodb.net/whatsapp_buddy?retryWrites=true&w=majority
```

### 3. Install & Run
```bash
npm install
npm run dev
```

- **Dashboard:** `http://localhost:5173`
- **Swagger Docs:** `http://localhost:5000/api-docs`
- **Backend API:** `http://localhost:5000`
