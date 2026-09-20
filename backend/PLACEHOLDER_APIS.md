# External API Placeholders

The following external API integrations require real credentials before production deployment:

---

## 1. ABHA / NHA Government Health API

**Purpose:** Fetch patient digital health records via ABHA ID

**Configuration:**
```env
ABHA_API_URL=https://api.abha.gov.in/v1
ABHA_API_KEY=your-abha-api-key-here
ABHA_API_SECRET=your-abha-api-secret-here
```

**Implementation:** Replace `kioskController.ts` → `fetchRecords()` with actual NHA API calls

---

## 2. Aadhaar / UIDAI Gateway

**Purpose:** OTP-based identity verification via Aadhaar number

**Configuration:**
```env
AADHAAR_API_URL=https://api.uidai.gov.in/v1
AADHAAR_API_KEY=your-aadhaar-api-key-here
```

**Implementation:** Replace `kioskController.ts` → Aadhaar auth with real UIDAI API

---

## 3. Groq Multimodal AI Engine

**Purpose:** Analyze tongue/eye images and voice recordings for Ayurvedic observations

**Configuration:**
```env
GROQ_API_URL=https://api.groq.com/openai/v1
GROQ_API_KEY=your-groq-api-key-here
```

**Implementation:** Replace `kioskController.ts` → Triage with Groq multimodal calls

---

## 4. Edge OCR Service

**Purpose:** Extract text from prescription and lab report images

**Configuration:**
```env
OCR_API_URL=https://api.ocr-service.example.com/v1
OCR_API_KEY=your-ocr-api-key-here
```

**Implementation:** Replace `kioskController.ts` → `processOCR()` with actual OCR API

---

## 5. DHIS2 Reporting

**Purpose:** Submit claims and payouts for completed encounters

**Configuration:**
```env
DHIS2_API_URL=https://dhis2.hospital.example.com/api
DHIS2_API_USERNAME=admin
DHIS2_API_PASSWORD=admin
```

**Implementation:** Replace `adminController.ts` → DHIS methods with real DHIS2 API

---

## 6. Email / SMS Notifications

**Purpose:** Notify patients about prescriptions and queue status

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@medikiosk.example.com
SMTP_PASS=your-email-password
```

**Implementation:** Already wired in `src/config/emailConfig.ts`
