# MediKiosk v5 - Backend API

Complete Node.js + TypeScript + MongoDB backend for the MediKiosk OPD Triage & Ayurvedic Assessment Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5+ (local or Atlas)
- npm or yarn

### Installation

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### Running

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

Server runs on `http://localhost:3001` by default.

## 📡 API Base URL

All endpoints are prefixed with `/api`:

```
http://localhost:3001/api
```

## 🔑 Authentication

All protected endpoints require a JWT Bearer token:

```http
Authorization: Bearer <your_access_token>
```

## 📚 Endpoints

### 🔓 Public Endpoints (No Auth)

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Staff login (physician/jan_aushadhi/admin) |
| POST | `/api/auth/patient/register` | Register walk-in patient |
| POST | `/api/auth/refresh` | Refresh access token |

#### Kiosk (Patient Flow)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kiosk/session` | Initialize kiosk session |
| PATCH | `/api/kiosk/session` | Update session (language, auth method) |
| POST | `/api/kiosk/consent` | Record consent (DPDP) |
| POST | `/api/kiosk/records` | Fetch digital health records (ABHA/Aadhaar) |
| POST | `/api/kiosk/ocr` | Process document via Edge OCR |
| POST | `/api/kiosk/triage` | Compute triage decision |
| POST | `/api/kiosk/voice/log` | Log voice command |
| GET | `/api/kiosk/summary` | Get patient summary |

### 🔒 Protected Endpoints

#### Physician (requires `role: physician`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/physician/dashboard/stats` | Dashboard stats |
| GET | `/api/physician/queue/:type` | Get queue (red/white/all) |
| GET | `/api/physician/patient/:id` | Get patient details |
| POST | `/api/physician/encounter` | Create encounter |
| PUT | `/api/physician/encounter/:id` | Update encounter |
| POST | `/api/physician/prescription` | Create prescription |
| GET | `/api/physician/prescriptions` | Pending prescriptions |
| PUT | `/api/physician/prescription/:id/dispense` | Dispense |
| GET | `/api/physician/ai-details/:patientId` | AI assessment details |
| GET | `/api/physician/handoff/:patientId` | 15-sec handoff summary |

#### Admin (requires `role: admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Hospital dashboard |
| GET | `/api/admin/dhis` | DHIS payout data |
| POST | `/api/admin/dhis/generate-claim` | Generate DHIS claim |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/system-status` | System status |
| GET | `/api/admin/patients` | List all patients |

## 🔑 Default Credentials

After first run, seed creates these default users:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Physician | `physician` | `physician123` |
| Physician | `drsharma` | `physician123` |
| Jan Aushadhi | `janaushadhi` | `janaushadhi123` |

## 🗄️ Database Models

- **User** — Staff accounts (admin, physician, jan_aushadhi)
- **Patient** — Patient records, queue assignments, consent
- **Consent** — DPDP-compliant consent ledger (append-only)
- **Encounter** — Clinical encounters

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (access + refresh tokens)
- **Security:** helmet, CORS, rate limiting, bcrypt
- **TypeScript:** Full TS support
- **Logging:** Morgan (dev) / structured JSON (prod)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # DB, CORS configs
│   ├── controllers/     # Business logic
│   │   ├── authController.ts
│   │   ├── kioskController.ts
│   │   ├── physicianController.ts
│   │   └── adminController.ts
│   ├── middleware/      # Auth, error, rate limit
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helpers
│   └── index.ts         # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 External API Placeholders

The backend has placeholders for these external services. See `.env.example` for configuration.

| Service | Variable | Purpose |
|---------|----------|---------|
| ABHA/NHA | `ABHA_API_URL`, `ABHA_API_KEY` | Government health ID |
| Aadhaar/UIDAI | `AADHAAR_API_URL`, `AADHAAR_API_KEY` | Identity verification |
| Groq AI | `GROQ_API_URL`, `GROQ_API_KEY` | Multimodal AI engine |
| Edge OCR | `OCR_API_URL`, `OCR_API_KEY` | Document OCR |
| DHIS2 | `DHIS2_API_URL`, credentials | Reporting/payouts |
| SMTP | SMTP_* | Email notifications |

## 🚦 Error Responses

```json
{
  "success": false,
  "error": "Error message here"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 429 | Too many requests (rate limited) |
| 500 | Server error |

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT
