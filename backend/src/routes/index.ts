import { Router, Request, Response } from "express";
import {
  initSession,
  updateSession,
  recordConsent,
  fetchRecords,
  processOCR,
  computeTriage,
  logVoiceCommand,
  getPatientSummary,
} from "../controllers/kioskController";
import {
  login,
  registerPatient,
  refreshToken,
  getMe,
  logout,
  debugUsers,
} from "../controllers/authController";
import {
  getDashboardStats,
  getQueue,
  getPatientDetail,
  createEncounter,
  updateEncounter,
  createPrescription,
  getAIDetails,
  getHandoff,
  getPendingPrescriptions,
  dispensePrescription,
} from "../controllers/physicianController";
import {
  getDashboard,
  getDHISPayout,
  generateClaim,
  listUsers,
  createUser,
  getSystemStatus,
  listPatients,
} from "../controllers/adminController";

const router = Router();


router.get("/kiosk/session", initSession);
router.patch("/kiosk/session", updateSession);

router.post("/kiosk/consent", recordConsent);

router.get("/kiosk/records", fetchRecords);
router.post("/kiosk/ocr", processOCR);

router.post("/kiosk/triage", computeTriage);

router.post("/kiosk/voice/log", logVoiceCommand);

router.get("/kiosk/summary", getPatientSummary);


router.post("/auth/login", login);

router.post("/auth/patient/register", registerPatient);

router.post("/auth/refresh", refreshToken);

router.get("/auth/me", getMe);

router.post("/auth/logout", logout);

router.get("/auth/debug/users", debugUsers);


router.get("/physician/dashboard/stats", getDashboardStats);

router.get("/physician/queue/:type", getQueue);
router.get("/physician/queue/:type/:token?", getPatientDetail);

router.post("/physician/encounter", createEncounter);
router.put("/physician/encounter/:id", updateEncounter);

router.post("/physician/prescription", createPrescription);
router.get("/physician/prescriptions", getPendingPrescriptions);
router.put("/physician/prescription/:id/dispense", dispensePrescription);

router.get("/physician/ai-details/:patientId", getAIDetails);

router.get("/physician/handoff/:patientId", getHandoff);


router.get("/admin/dashboard", getDashboard);

router.get("/admin/dhis", getDHISPayout);
router.post("/admin/dhis/generate-claim", generateClaim);

router.get("/admin/users", listUsers);
router.post("/admin/users", createUser);

router.get("/admin/system-status", getSystemStatus);

router.get("/admin/patients", listPatients);


router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "MediKiosk Backend API is running",
    version: "1.0.0",
  });
});

export default router;
