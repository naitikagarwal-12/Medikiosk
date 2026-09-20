# MediKiosk

AI-powered multimodal OPD triage and Ayurvedic assessment platform. A self-serve kiosk captures patient data (voice, camera, documents, questionnaire), runs AI-assisted triage and Ayurvedic *Ashtavidha Pariksha*, and hands off to physician, admin, and Jan Aushadhi dashboards — with Indic-language voice and a sign-language avatar for accessibility.

## Architecture

Three independently deployable services in one monorepo:

| Service | Path | Stack |
| --- | --- | --- |
| Frontend | repo root | React 19, Vite 8, TypeScript, Tailwind CSS v4, React Router |
| Backend API | `backend/` | Node 22, Express, TypeScript, MongoDB (Mongoose), JWT |
| Bhashini Bridge | `backend/bhashini/` | Python 3.11, Flask — Indic ASR / TTS / translation via MeitY Bhashini, Groq fallback |

The frontend calls the Backend API for data/auth and the Bhashini Bridge for voice and translation features.

## Repository layout

```
.
├── src/                  Frontend (React + Vite)
│   ├── screens/          Kiosk, physician, admin, and login flows
│   ├── components/       Camera feed, sign-language avatar, voice assistant, layouts
│   ├── context/          Auth and kiosk session state
│   ├── hooks/            Bhashini ASR/TTS, translation, voice assistant
│   ├── services/         Sign-language and Bhashini clients
│   └── utils/api.ts      Backend API client
├── backend/
│   ├── src/              Express API (controllers, models, routes, middleware)
│   └── bhashini/         Python Flask bridge
├── docs/                 Backend architecture notes
├── vercel.json           Frontend deploy config (Vercel)
├── render.yaml           Backend + Bhashini deploy config (Render Blueprint)
├── DEPLOYMENT.md         Deployment and environment-variable guide
└── SETUP.md              Local setup, demo credentials, and API reference
```

## Getting started

Prerequisites: Node 22, Python 3.11+, and a MongoDB instance (local or Atlas).

### 1. Backend API

```bash
cd backend
cp .env.example .env      # then fill in your values
npm install
npm run dev               # http://localhost:3001  (health: /health)
```

### 2. Bhashini Bridge (optional — voice & translation)

```bash
cd backend/bhashini
cp .env.example .env      # then fill in your Bhashini/Groq keys
python -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py             # http://localhost:5001
```

### 3. Frontend

```bash
# from the repo root
cp .env.example .env.local
npm install
npm run dev               # http://localhost:8443
```

Set `VITE_API_URL` and `VITE_BHASHINI_URL` in `.env.local` if the backends are not on their default local ports.

Demo logins and seeded data are listed in [SETUP.md](./SETUP.md).

## Scripts

| Command | Where | Purpose |
| --- | --- | --- |
| `npm run dev` | root | Start the Vite dev server |
| `npm run build` | root | Production build to `dist/` |
| `npm run lint` | root | TypeScript type-check (`tsc --noEmit`) |
| `npm run dev` | `backend/` | Backend with hot reload |
| `npm run build` | `backend/` | Compile backend to `dist/` |
| `npm run seed` | `backend/` | Seed demo users and patients |

## Deployment

- Frontend → **Vercel** (`vercel.json`)
- Backend API and Bhashini Bridge → **Render** (`render.yaml` Blueprint)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full environment-variable matrix and the steps to wire the three services together.

## Security

Secrets are never committed. Real values live in `.env` files (git-ignored); only `.env.example` templates are tracked. Provide production secrets through the Vercel and Render dashboards.
