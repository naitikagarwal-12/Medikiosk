# MediKiosk v3 — Backend Architecture & Component Interaction

> **Scope note:** the current codebase in this repo is a frontend-only React SPA using
> in-memory/localStorage-style contexts (`AuthContext`, `KioskContext`) as stand-ins for a
> real backend. This document specifies the backend architecture that those contexts are
> designed to be swapped onto — the API surface, data flow, security model, and routing
> rules a production deployment needs — so the frontend can be connected to real services
> without further redesign.

## 1. High-level architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT DEVICES                                │
│  ┌───────────────┐   ┌──────────────────┐   ┌───────────────────────────┐  │
│  │ Patient Kiosk │   │ Staff Web (Doctor,│   │ Admin Console (/admin,    │  │
│  │ (touchscreen, │   │ Jan Aushadhi)     │   │ hidden route)             │  │
│  │ voice + sign  │   │                   │   │                           │  │
│  │ language UI)  │   │                   │   │                           │  │
│  └───────┬───────┘   └─────────┬─────────┘   └─────────────┬─────────────┘  │
└──────────┼─────────────────────┼───────────────────────────┼───────────────┘
           │ HTTPS (TLS 1.2+)    │                            │
           ▼                     ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / BFF LAYER                           │
│   • TLS termination, WAF, rate limiting                                    │
│   • RBAC middleware (validates JWT + role claim per route)                 │
│   • Request routing to backend services below                             │
└───────┬───────────┬───────────┬────────────┬────────────┬──────────────────┘
        │            │           │            │            │
        ▼            ▼           ▼            ▼            ▼
┌───────────┐ ┌─────────────┐ ┌──────────┐ ┌───────────┐ ┌────────────────┐
│   Auth    │ │   Consent   │ │  ABHA /  │ │  Voice    │ │  Triage / AI   │
│  Service  │ │  Service    │ │ Aadhaar  │ │ Processing│ │  Assessment    │
│ (roles,   │ │ (DPDP T&C,  │ │ Gateway  │ │ Service   │ │  Service       │
│ sessions) │ │ audit log)  │ │ (govt    │ │ (STT/TTS  │ │ (symptom       │
│           │ │             │ │ APIs)    │ │ proxy +   │ │ scoring, eye/  │
│           │ │             │ │          │ │ intent    │ │ tongue/voice   │
│           │ │             │ │          │ │ matching) │ │ inference)     │
└─────┬─────┘ └──────┬──────┘ └────┬─────┘ └─────┬─────┘ └───────┬────────┘
      │              │              │             │               │
      └──────────────┴──────┬───────┴─────────────┴───────────────┘
                             ▼
                 ┌───────────────────────────┐
                 │   OPD / Hospital Systems   │
                 │  • Patient Registry (EHR)  │
                 │  • Queue & Token Service   │
                 │  • Pharmacy (Jan Aushadhi) │
                 │  • DHIS / Reporting        │
                 └────────────┬──────────────┘
                              ▼
                 ┌───────────────────────────┐
                 │        Data Stores        │
                 │  • Postgres (transactional)│
                 │  • Object storage (scans, │
                 │    eye/tongue images —    │
                 │    encrypted at rest)     │
                 │  • Consent ledger (append-│
                 │    only, immutable)       │
                 │  • Audit log store        │
                 └───────────────────────────┘
```

## 2. Components and responsibilities

| Component | Responsibility | Talks to |
|---|---|---|
| **Patient Kiosk (frontend)** | Renders `KioskLayout`-based screens; drives `VoiceAssistant` (speaker/mic) and `SignLanguageAvatar`; holds transient session state in `KioskContext` | API Gateway only — never calls ABHA/Aadhaar or storage directly |
| **Staff Web (Doctor / Jan Aushadhi)** | Dedicated login pages (`/login/doctor`, `/login/jan-aushadhi`) + role dashboards | API Gateway, scoped by JWT role claim |
| **Admin Console** | Hidden `/admin` route, gated by `AdminGate` | API Gateway, `admin` role claim only |
| **API Gateway / BFF** | Single entry point; terminates TLS; verifies JWT signature + expiry; enforces RBAC per route; rate-limits kiosk endpoints to blunt abuse | All backend services |
| **Auth Service** | Issues short-lived JWTs (patient session token, staff access token + refresh token); stores password hashes (staff only — patients never have a password, see §5) | Postgres (users, sessions) |
| **Consent Service** | Serves the DPDP notice content; records each consent/decline as an immutable, timestamped entry in the consent ledger; exposes a "withdraw consent" endpoint for the patient-rights requirement | Consent ledger (append-only) |
| **ABHA / Aadhaar Gateway** | Thin proxy to government identity/health-record APIs; never persists Aadhaar number or OTP beyond the verification call | External govt APIs, Auth Service (to mint a verified-identity session) |
| **Voice Processing Service** | Optional server-side fallback for STT/TTS (the kiosk primarily uses the on-device Web Speech API for latency and offline resilience); logs recognized-intent + confidence for QA, not raw audio | Triage Service (for intent-driven navigation events), Audit log |
| **Triage / AI Assessment Service** | Scores questionnaire answers + optional eye/tongue/voice captures into a red/white queue decision and preliminary summary | Patient Registry, Object storage (captured images) |
| **OPD / Hospital Systems** | Patient Registry (EHR), Queue & Token Service, Pharmacy (Jan Aushadhi dispensing), DHIS reporting/payouts | Postgres, downstream government reporting systems |

## 3. Routing architecture (frontend ⇄ backend)

The frontend route table maps directly onto backend authorization scopes. `ProtectedRoute`
carries an explicit `loginPath` per role so an unauthenticated visit never lands on the wrong
sign-in page:

| Frontend route | Auth requirement | `loginPath` if unauthenticated | Backend scope required |
|---|---|---|---|
| `/opd`, `/language`, `/data-consent`, `/auth`, … (kiosk flow) | Anonymous kiosk session (auto-issued) | n/a | `kiosk:session` |
| `/login/doctor` | none (public form) | — | issues `role:physician` |
| `/login/jan-aushadhi` | none (public form) | — | issues `role:jan_aushadhi` |
| `/admin`, `/admin/dhis`, `/system-status` | `role:admin` | `/admin` itself (hidden `AdminGate`, never `/login`) | `role:admin` |
| `/physician/*` | `role:physician` | `/login/doctor` | `role:physician` |
| `/dispensary` | `role:jan_aushadhi` | `/login/jan-aushadhi` | `role:jan_aushadhi` |

Backend mirrors this with a route-scoped middleware table (e.g. Express/Fastify or an API
Gateway policy), so authorization is enforced twice — once for UX (client-side redirect) and
once authoritatively (server-side 401/403) — never trusting the client-side check alone.

## 4. Key sequence flows

### 4.1 Patient consent → registration

```
Patient        Kiosk FE            API Gateway        Consent Service     Auth/Kiosk Session
  │  arrives      │                     │                     │                    │
  │──────────────▶│  GET /kiosk/session │                     │                    │
  │               │────────────────────▶│────────────────────────────────────────▶│
  │               │◀────────────────────│◀────────────────────────────────────────│ kiosk_session_id
  │  picks lang   │                     │                     │                    │
  │──────────────▶│ PATCH session.lang  │                     │                    │
  │               │────────────────────▶│                                         │
  │  views DPDP   │ GET /consent/notice │                     │                    │
  │  notice       │────────────────────▶│────────────────────▶│                    │
  │               │◀────────────────────│◀────────────────────│ notice content     │
  │  checks T&C,  │ POST /consent       │                     │                    │
  │  clicks Agree │ {sessionId, agreed: │                     │                    │
  │──────────────▶│  true, categories}  │                     │                    │
  │               │────────────────────▶│────────────────────▶│ append to ledger   │
  │               │◀────────────────────│◀────────────────────│ 201 {consentId}    │
  │               │  navigate → /auth   │                     │                    │
  │                                                                                │
  │  declines     │ POST /consent       │                     │                    │
  │──────────────▶│ {agreed: false}     │────────────────────▶│ append to ledger   │
  │               │◀── 200 ─────────────│◀────────────────────│ (decline logged)   │
  │               │ navigate → /opd (reset kiosk session)                          │
```

Server-side enforcement: `/auth`, `/qr-scan`, `/aadhaar-auth`, and every route past consent
require the gateway to see a `consentId` of `agreed:true` attached to the `kiosk_session_id`
before proxying the request onward — this is what makes the "must check T&C to proceed" rule
authoritative rather than just a disabled button in the UI.

### 4.2 Staff authentication (Doctor / Jan Aushadhi / Admin)

```
Staff        Dedicated Login Page      API Gateway        Auth Service
 │  opens /login/doctor  │                  │                  │
 │──────────────────────▶│                  │                  │
 │  submits creds        │ POST /auth/login │                  │
 │───────────────────────▶│ {role: physician,│                 │
 │                        │  username, pw}   │─────────────────▶│ verify hash,
 │                        │                  │                  │ issue JWT (role
 │                        │◀─────────────────│◀─────────────────│ claim embedded)
 │                        │  set httpOnly    │                  │
 │                        │  refresh cookie  │                  │
 │◀───────────────────────│  navigate → role home              │
```

Each role's JWT carries a single `role` claim matching exactly one of `patient | physician |
jan_aushadhi | admin`. The gateway rejects any request whose route-required role doesn't match
the token's claim with `403`, independent of the frontend's own `ProtectedRoute` redirect.

### 4.3 Voice command → automatic workflow progression

```
Patient      VoiceAssistant (FE)     KioskLayout            API Gateway    Triage/Intent
 │ taps 🎙    │                       │                       │                │
 │───────────▶│ Web Speech API STT    │                       │                │
 │  speaks    │ (on-device, live)     │                       │                │
 │───────────▶│ final transcript      │                       │                │
 │            │──────────────────────▶│ onVoiceCommand(text)  │                │
 │            │                       │  page-specific match? │                │
 │            │                       │   yes → act + navigate│                │
 │            │                       │   no  → generic       │                │
 │            │                       │   "next/continue/yes" │                │
 │            │                       │   + nextRoute → navigate               │
 │            │◀── speak("Got it.") ──│                       │                │
 │            │  (optional) POST /voice/log {transcript, route}│                │
 │            │──────────────────────────────────────────────▶│───────────────▶│ QA + analytics
```

Voice recognition and synthesis run **client-side** (Web Speech API) for low latency and to
avoid streaming raw audio off the kiosk. Only the recognized *text* and the resulting
navigation event are optionally sent server-side for logging/QA — never raw audio — which
keeps the voice feature DPDP-friendly (minimal data collection).

## 5. Data handling & DPDP compliance

- **Patient identity data (name, mobile, ABHA/Aadhaar number, OTP):** the ABHA/Aadhaar Gateway
  proxies verification calls to government APIs and returns only a verified-identity token;
  the raw Aadhaar number and OTP are never written to MediKiosk's own database.
- **Consent ledger:** append-only table (`consent_id`, `kiosk_session_id`, `patient_ref`,
  `categories[]`, `agreed`, `timestamp`, `notice_version`). Never updated in place — a
  withdrawal is a new row, preserving full audit history as required for DPDP accountability.
- **Biometric assessment data (eye/tongue images, voice recordings):** stored in object storage
  with server-side encryption, a short retention window tied to the clinical record, and access
  restricted to the treating physician's session — enforced by the Triage Service, not the
  frontend.
- **Data minimisation:** the kiosk session itself is anonymous until the patient reaches the
  authentication step; nothing patient-identifying is persisted before that point.
- **Patient rights endpoints:** `GET /me/data`, `POST /me/data/correct`, `POST /consent/withdraw`,
  `POST /grievance` — surfaced to patients through hospital staff, per the DPDP rights listed on
  the `/data-consent` screen.

## 6. State management

- **Kiosk session (`KioskContext`):** client-held, ephemeral, mirrored server-side by a
  `kiosk_session_id` cookie/token scoped to the physical device. Cleared on `reset()` — called
  automatically when a patient declines consent, and on token completion.
- **Staff session (`AuthContext`):** short-lived JWT access token (in memory) + httpOnly refresh
  cookie, refreshed silently by the API Gateway; `role` claim drives both the frontend
  `ProtectedRoute` gating and the backend's authoritative RBAC check.
- **Cross-tab/session safety:** because roles never overlap (a browser tab is either a kiosk,
  a staff session, or the hidden admin session), the gateway keys sessions by role + device
  fingerprint to prevent a staff token from being replayed against kiosk-only endpoints.

## 7. Non-functional considerations

- **Transport security:** TLS 1.2+ everywhere; mTLS between the API Gateway and internal
  services (Auth, Consent, Triage, ABHA Gateway).
- **Rate limiting:** kiosk endpoints (public, no auth) are the highest-risk surface — apply
  per-device rate limits and CAPTCHA-free bot heuristics (kiosks are physically supervised).
- **Observability:** structured logs correlated by `kiosk_session_id` / `request_id` across
  every service, so a single patient journey (consent → auth → triage → queue token) can be
  traced end-to-end for support and compliance audits.
- **Resilience:** the Voice Processing Service and ABHA/Aadhaar Gateway are external-dependency
  points; the frontend degrades gracefully (manual tap-through UI) if either is unavailable,
  which is why STT/TTS runs on-device rather than depending on a live backend call.

## 8. Bhashini bridge (multilingual voice layer)

A dedicated **Python Flask** microservice at `backend/bhashini/` is the
multilingual voice bridge. It wraps the Bhasini ULCA (Universal Language
Contribution API, MeitY) and exposes four endpoints to the React frontend:

| Endpoint | Purpose | Pipeline |
|---|---|---|
| `POST /bhashini/asr-translate` | Patient speech in any of 10 Indic languages → English text (ready for Groq) | ASR + NMT, two compute calls |
| `POST /bhashini/translate` | NMT only (used by the sign-language avatar for Indic input) | NMT, one compute call |
| `POST /bhashini/translate-and-speak` | English text from Groq → translated Indic text + synthesised Indic audio | NMT + TTS, two compute calls |
| `GET /bhashini/health` | Liveness + cache stats + reachability | — |

### Two-step Bhasini protocol

Every compute call goes through Bhasini's two-step protocol:

1. **Config (`getModelsPipeline`).** POST to
   `https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline`
   with `userID` / `ulcaApiKey` headers and a list of `pipelineTasks` for
   the language pair. Bhasini returns the optimal `serviceId` per task and a
   `callbackUrl` to use for inference. Results are cached in-memory for
   `BHASHINI_PIPELINE_CACHE_TTL` seconds (default 1 h) keyed by
   `(taskType, sourceLang, targetLang)` so we don't re-authenticate per
   request.

2. **Compute (inference).** POST to the returned `callbackUrl` with an
   `Authorization: Bearer <BHASHINI_INFERENCE_KEY>` header and a
   `pipelineTasks` / `inputData` payload. Bhasini runs the requested models
   and returns the result.

### Upstream sequence — patient speech → Groq

```
Patient      Kiosk FE             Bhasini Bridge        Bhasini ULCA      Groq LLM
   │   speaks Hindi             │                       │                │
   │  🎙 captured as webm/opus  │                       │                │
   │───────────────────────────▶│  POST /asr-translate  │                │
   │                            │  {audioBase64, "hi"}  │                │
   │                            │                       │                │
   │                            │  getModelsPipeline(asr)                │
   │                            │ ─────────────────────▶│                │
   │                            │  serviceId, callbackUrl                │
   │                            │ ◀─────────────────────│                │
   │                            │  compute(asr)         │                │
   │                            │ ─────────────────────▶│                │
   │                            │  Hindi text           │                │
   │                            │ ◀─────────────────────│                │
   │                            │  getModelsPipeline(nmt hi→en)          │
   │                            │ ─────────────────────▶│                │
   │                            │  compute(nmt)         │                │
   │                            │ ─────────────────────▶│                │
   │                            │  English text         │                │
   │                            │ ◀─────────────────────│                │
   │                            │  POST /kiosk/triage   │                │
   │                            │  {englishText}        │  ──────────────▶│
   │                            │                       │   next clinical │
   │                            │                       │   question      │
   │                            │                       │   ◀──────────── │
   │                            │  POST /bhashini/translate-and-speak     │
   │                            │  {english, "hi"}      │                │
   │                            │  NMT en→hi + TTS      │                │
   │                            │ ─────────────────────▶│                │
   │                            │  translated text      │                │
   │                            │  base64 WAV audio     │                │
   │                            │ ◀─────────────────────│                │
   │  audio plays in Hindi      │                       │                │
   │ ◀──────────────────────────│                       │                │
```

### Downstream sequence — Groq → patient

```
Groq LLM    Bhasini Bridge          Bhasini ULCA
   │              │                       │
   │  English      │  POST /bhashini/      │
   │  question ──▶ │  translate-and-speak  │
   │              │  {text, "hi"}         │
   │              │                       │
   │              │  NMT en→hi            │
   │              │ ─────────────────────▶│
   │              │  translated text      │
   │              │ ◀─────────────────────│
   │              │  TTS hi               │
   │              │ ─────────────────────▶│
   │              │  base64 audio         │
   │              │ ◀─────────────────────│
   │              │  {translatedText,     │
   │              │   audioBase64}        │
   │              │                       │
   │  <Audio plays through kiosk speakers> │
```

### Integration with the sign-language avatar

The sign-language avatar (`src/components/SignLanguageAvatar.tsx`) accepts a
free-text sentence. When the patient has selected a non-English language
on the LanguageSelection screen, the avatar first calls
`POST /bhashini/translate` with the typed Indic text, then tokenises the
resulting English text with Groq and plays it on the 20-pose animated
figure. The patient sees both the original Indic text and the English
translation as captions, so meaning is never lost. When the selected
language is `en` (or the Bhasini service is unreachable), the translation
step is skipped and the avatar signs the typed text directly.

### Keys and security

The three Bhasini keys (`BHASHINI_UDYAT_KEY`, `BHASHINI_API_KEY`,
`BHASHINI_INFERENCE_KEY`) live exclusively in `backend/bhashini/.env` and
are never sent to the React frontend. The browser talks only to the
Python service at `VITE_BHASHINI_URL`.

### Run

```bash
cd backend/bhashini
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in the three Bhasini keys
python app.py                   # listens on http://localhost:5001
```

### Why Bhasini (vs. Whisper / Google STT)

- **Optimised for Indic.** Trained by AI4Bharat, handles thick regional
  dialects and code-mixing (Hindi + English in the same sentence).
- **Sub-2-second latency.** ASR + NMT + TTS chained in one backend
  compute call, no per-step network round trips.
- **DPDP / ABDM compliance.** MeitY initiative; integrates naturally with
  the national Digital Public Infrastructure (ABDM).
- **Resilience.** If the bridge is unreachable, the kiosk frontend falls
  back to the browser's on-device Web Speech API so the patient is never
  blocked.
