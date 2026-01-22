# WhatsApp Noweb Microservice 🚀

A robust and lightweight WhatsApp API microservice built with Node.js and `@whiskeysockets/baileys`. 
This service is designed as an **outbound-only** bridge for your SAAS (e.g., Laravel backend) to send messages without the overhead of Puppeteer or a browser.

## Features
- **Ultra-Lightweight**: No Puppeteer, purely socket-based.
- **High Density**: Optimized to run 100+ session instances on an 8GB VPS.
- **Production Ready**: Secured with API Keys and Docker/Coolify configuration.
- **Laravel Integration**: Built-in webhook support for session status updates.

---

## 🛠 Configuration & Deployment

### Environment Variables (`.env`)
Copy `.env.example` to `.env` and configure:
```env
PORT=3000
API_KEY=your_secret_key
WEBHOOK_URL=https://your-laravel-app.com/api/whatsapp/webhook
```

### Deployment (Coolify / Docker)
The project includes a `Dockerfile` and `docker-compose.yml`.
Ensure the `./sessions` directory is mounted as a persistent volume to keep your WhatsApp login sessions across restarts.

---

## 🔐 Authentication
All API requests **must** include the following header:
- `X-API-KEY`: Your secret key defined in `.env`.

---

## 🚀 API Endpoints

### 📱 Session Management

#### 1. Create or Resume Session
`POST /session/{id}`
Initializes or reconnects a session. Returns a QR code if a new login is required.

#### 2. Get QR Code (Image)
`GET /session/{id}/qr`
Returns the QR code as a PNG image directly.

#### 3. List Sessions
`GET /sessions`
Returns a list of all managed sessions and their states.

#### 4. Delete Session
`DELETE /session/{id}`
Logs out and deletes all local session data.

---

### 🔍 Verification

#### 1. Check if number exists
`GET /check-number/{sessionId}/{number}`
Verify if a phone number is registered on WhatsApp before sending.

**Response Example:**
```json
{
  "number": "22990000000",
  "exists": true,
  "jid": "22990000000@s.whatsapp.net"
}
```

---

### ✉️ Messaging

#### 1. Send Single Message (Text or Media)
`POST /send`

**Body Raw (JSON) - Text Message:**
```json
{
  "sessionId": "bossi",
  "to": "22990000000",
  "message": "Bonjour ! Ceci est un message texte."
}
```

**Body Raw (JSON) - Image Message:**
```json
{
  "sessionId": "bossi",
  "to": "22990000000",
  "mediaUrl": "https://example.com/image.png",
  "mediaType": "image",
  "message": "Regardez cette image !",
  "caption": "Légende de l'image"
}
```

**Options for `mediaType`**: `image`, `video`, `audio`, `document`.

---

#### 2. Send Bulk Messages
`POST /send-bulk`
Sends messages to multiple recipients with a configurable delay to prevent spam detection.

**Body Raw (JSON):**
```json
{
  "sessionId": "bossi",
  "receivers": ["22990000001", "22990000002"],
  "message": "Notification importante pour tous !",
  "delayMs": 2000,
  "mediaUrl": "https://example.com/promo.jpg",
  "mediaType": "image"
}
```

---

#### 3. Send Contact (VCard)
`POST /send-contact`
Send a professional contact card to a recipient.

**Body Raw (JSON):**
```json
{
  "sessionId": "bossi",
  "to": "22990000000",
  "contactName": "John Doe",
  "contactNumber": "22991919191",
  "organization": "Ma Super Entreprise"
}
```

---

### 📂 Information Retrieval

#### 1. List Groups
`GET /groups/{sessionId}`

#### 2. List Contacts
`GET /contacts/{sessionId}`

---

## 🪝 Webhooks
If `WEBHOOK_URL` is configured, the microservice will push the following event:

**Session Status Update:**
```json
{
  "event": "session.status",
  "timestamp": "2024-01-22T10:00:00.000Z",
  "data": {
    "sessionId": "bossi",
    "status": "connected"
  }
}
```
*Note: Incoming message listening is disabled for maximum performance. Use your Laravel backend for business logic.*
