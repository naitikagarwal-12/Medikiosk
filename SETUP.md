# MediKiosk v5 - Full Stack Setup

## ✅ Status: Backend Running & Connected to MongoDB

### Backend is Live
```
URL: http://localhost:3001/api
Health: http://localhost:3001/health
MongoDB: Connected ✓
```

### Quick Test Commands

```bash
# Test health endpoint
curl http://localhost:3001/health

# Check users/patients in DB
curl http://localhost:3001/api/auth/debug/users

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role":"physician","username":"physician","password":"physician123"}'

# Register new patient
curl -X POST http://localhost:3001/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","mobile":"9876543210","age":45,"gender":"male"}'
```

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Physician | `physician` | `physician123` |
| Physician | `drsharma` | `physician123` |
| Jan Aushadhi | `janaushadhi` | `janaushadhi123` |

## Pre-seeded Demo Data

### Users (5)
- Hospital Admin, Dr. R. Sharma (×2), Dr. Priya Patel, Jan Aushadhi Staff

### Patients (5)
- Ananya Sharma (R-027, RED queue)
- Rajesh Kumar (R-028, RED queue)
- Priya Singh (A-142, WHITE queue)
- Mohan Das (A-140, WHITE queue)
- Sunita Rao (A-141, WHITE queue)

## Running the Backend

```bash
cd backend
npm install   # If not already done
npm run dev   # Development mode with hot reload
```

## Running the Frontend

```bash
# In project root (different terminal)
npm run dev
# Frontend: http://localhost:8443 (Figma Make)
```

## API Endpoints

### Public
- `POST /api/auth/login` - Staff login
- `POST /api/auth/patient/register` - Patient registration
- `GET /api/kiosk/session` - Initialize kiosk session
- `GET /api/auth/debug/users` - Check DB (dev only)

### Protected (needs JWT)
- `GET /api/auth/me` - Current user
- `GET /api/physician/queue/:type` - Patient queue
- `POST /api/physician/encounter` - Create encounter
- `POST /api/physician/prescription` - Create prescription
- `GET /api/admin/dashboard` - Hospital dashboard
- `GET /api/admin/dhis` - DHIS payout

## Project Structure

```
MediKiosk_v5/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, CORS, Email
│   │   ├── controllers/    # Auth, Kiosk, Physician, Admin
│   │   ├── middleware/     # Auth, Error, Rate limiting
│   │   ├── models/         # User, Patient, Consent, Encounter
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Seed data
│   │   └── index.ts       # Entry point
│   ├── .env                # Environment config
│   └── package.json
├── src/
│   ├── context/           # AuthContext, KioskContext
│   ├── screens/            # All frontend screens
│   ├── components/         # UI components
│   └── utils/api.ts        # API client
└── SETUP.md
```
