# MediKiosk Bhashini Bridge

A small Python Flask service that wraps the **Bhasini ULCA** (Universal Language
Contribution API) so the React kiosk can:

- **Listen** to a patient speaking any of 10 supported Indic languages and
  return English text (ready to feed into the Groq LLM).
- **Speak** to the patient in their chosen Indic language by synthesising
  audio from English text.

This service is intentionally tiny — it is one job, and the existing Node/Express
backend (`backend/`) continues to handle auth, consent, ABHA, triage, etc.

## Architecture

```
React Kiosk             Bhasini Bridge (this)            Bhasini ULCA
   │                          │                                │
   │ POST /bhashini/asr-      │                                │
   │   translate              │                                │
   │  {audioBase64, hi}       │  Step A: getModelsPipeline     │
   │ ──────────────────────▶  │ ─────────────────────────────▶ │
   │                          │  serviceId + callbackUrl       │
   │                          │ ◀───────────────────────────── │
   │                          │  Step B: inference (ASR)       │
   │                          │ ─────────────────────────────▶ │
   │                          │  source-language text          │
   │                          │ ◀───────────────────────────── │
   │                          │  Step B: inference (NMT)       │
   │                          │ ─────────────────────────────▶ │
   │                          │  English text                  │
   │                          │ ◀───────────────────────────── │
   │  {sourceText,            │                                │
   │   englishText}           │                                │
   │ ◀──────────────────────  │                                │
   │                          │                                │
   │ POST /bhashini/translate-                                 │
   │   and-speak              │                                │
   │  {text, hi}              │                                │
   │ ──────────────────────▶  │  Step A: getModelsPipeline(NMT)│
   │                          │  Step B: inference (NMT)       │
   │                          │  Step A: getModelsPipeline(TTS)│
   │                          │  Step B: inference (TTS)       │
   │  {translatedText,        │                                │
   │   audioBase64,           │                                │
   │   mimeType: "audio/wav"} │                                │
   │ ◀──────────────────────  │                                │
```

Step A (config) is cached per `(taskType, sourceLang, targetLang)` so we only
hit the ULCA auth endpoint once per language pair per hour.

## Quick start

```bash
cd backend/bhashini
python -m venv .venv
.venv\Scripts\activate            # Windows
# .venv/bin/activate              # macOS / Linux
pip install -r requirements.txt
cp .env.example .env              # then edit .env with your Bhasini keys
python app.py                     # listens on port 5001
```

For production:

```bash
gunicorn -w 2 -b 0.0.0.0:5001 app:create_app\(\)
```

## Environment

| Variable | Required | Default | Notes |
|---|---|---|---|
| `BHASHINI_UDYAT_KEY` | yes | — | Sent as `userID` header to `getModelsPipeline` |
| `BHASHINI_API_KEY` | yes | — | Sent as `ulcaApiKey` header to `getModelsPipeline` |
| `BHASHINI_INFERENCE_KEY` | yes | — | Sent as `Authorization: Bearer ...` for inference |
| `BHASHINI_INFERENCE_URL` | no | `https://dhruva-api.bhashini.gov.in/services/inference/pipeline` | Override if your account uses a different callback |
| `BHASHINI_PORT` | no | `5001` | What port the Flask app listens on |
| `BHASHINI_PIPELINE_CACHE_TTL` | no | `3600` | Seconds to cache `getModelsPipeline` results |
| `FLASK_DEBUG` | no | `0` | Set to `1` for dev auto-reload |

## Endpoints

All routes are mounted at `/bhashini/`.

### `GET /bhashini/health`

Returns liveness + cache stats + whether Bhasini is reachable.

```json
{
  "success": true,
  "ok": true,
  "pipelineCache": { "total": 0, "valid": 0, "expired": 0 },
  "bhasiniReachable": true
}
```

### `POST /bhashini/translate`

NMT only — translate text from one language to another.

```json
// Request
{ "text": "मुझे सिर दर्द है", "sourceLang": "hi", "targetLang": "en" }

// Response
{ "success": true, "translatedText": "I have a headache" }
```

`sourceLang: "auto"` lets Bhasini detect the language automatically.

### `POST /bhashini/asr-translate`

Upstream: Indic audio → Hindi/Indic text → English text.

```json
// Request
{ "audioBase64": "<base64 of 16kHz mono WAV>", "sourceLang": "hi" }

// Response
{ "success": true, "sourceText": "मुझे सिर दर्द है", "englishText": "I have a headache" }
```

### `POST /bhashini/translate-and-speak`

Downstream: English text → translated text + synthesised audio in target language.

```json
// Request
{ "text": "Please describe your symptoms.", "targetLang": "hi" }

// Response
{ "success": true, "translatedText": "कृपया अपने लक्षण बताएं।", "audioBase64": "UklGRiQ...", "mimeType": "audio/wav" }
```

## Supported languages

The same 10 already declared in `src/screens/kiosk/LanguageSelection.tsx`:

`en` (English), `hi` (Hindi), `bn` (Bengali), `mr` (Marathi), `ta` (Tamil),
`te` (Telugu), `kn` (Kannada), `ml` (Malayalam), `gu` (Gujarati), `pa` (Punjabi).

## Testing

```bash
pytest tests/                 # runs offline with mocked HTTP
```

## CORS

The Flask app is configured to allow requests from:
- `http://localhost:8443` and `https://localhost:8443` (React dev server)
- `http://localhost:3001` and `http://127.0.0.1:8443` (Node backend, for proxying)

If you deploy to production, edit `create_app()` in `app.py` to restrict origins
to your real domain.
