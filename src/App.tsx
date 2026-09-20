import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { KioskProvider } from "./context/KioskContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./screens/Login";
import DoctorLogin from "./screens/DoctorLogin";
import JanAushadhiLogin from "./screens/JanAushadhiLogin";
import AdminLogin from "./screens/AdminLogin";

import Welcome from "./screens/kiosk/Welcome";
import LanguageSelection from "./screens/kiosk/LanguageSelection";
import Authentication from "./screens/kiosk/Authentication";
import QRScan from "./screens/kiosk/QRScan";
import AadhaarAuth from "./screens/kiosk/AadhaarAuth";
import RecordFetch from "./screens/kiosk/RecordFetch";
import RecordSelect from "./screens/kiosk/RecordSelect";
import ScanDocuments from "./screens/kiosk/ScanDocuments";
import PatientProfile from "./screens/kiosk/PatientProfile";
import Questionnaire from "./screens/kiosk/Questionnaire";
import DataConsent from "./screens/kiosk/DataConsent";
import Consent from "./screens/kiosk/Consent";
import AshtavidhaPariksha from "./screens/kiosk/AshtavidhaPariksha";
import TongueCapture from "./screens/kiosk/TongueCapture";
import EyeCapture from "./screens/kiosk/EyeCapture";
import VoiceCapture from "./screens/kiosk/VoiceCapture";
import AIProcessing from "./screens/kiosk/AIProcessing";
import AISummary from "./screens/kiosk/AISummary";
import Triage from "./screens/kiosk/Triage";
import QueueToken from "./screens/kiosk/QueueToken";

import PhysicianDashboard from "./screens/physician/PhysicianDashboard";
import ClinicalQueue from "./screens/physician/ClinicalQueue";
import PhysicianHandoff from "./screens/physician/PhysicianHandoff";
import AIDetails from "./screens/physician/AIDetails";
import Encounter from "./screens/physician/Encounter";
import Prescription from "./screens/physician/Prescription";

import AdminDashboard from "./screens/admin/AdminDashboard";
import DHISPayout from "./screens/admin/DHISPayout";

import Dispensary from "./screens/Dispensary";
import MobileApp from "./screens/MobileApp";
import SystemStatus from "./screens/SystemStatus";

function AdminGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return <AdminLogin />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <KioskProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/opd" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/doctor" element={<DoctorLogin />} />
        <Route path="/login/jan-aushadhi" element={<JanAushadhiLogin />} />

        <Route path="/opd" element={<Welcome />} />
        <Route path="/language" element={<LanguageSelection />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/qr-scan" element={<QRScan />} />
        <Route path="/aadhaar-auth" element={<AadhaarAuth />} />
        <Route path="/record-fetch" element={<RecordFetch />} />
        <Route path="/record-select" element={<RecordSelect />} />
        <Route path="/scan-documents" element={<ScanDocuments />} />
        <Route path="/walkin-scan" element={<Navigate to="/scan-documents" replace />} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/data-consent" element={<DataConsent />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/ashtavidha" element={<AshtavidhaPariksha />} />
        <Route path="/tongue-capture" element={<TongueCapture />} />
        <Route path="/eye-capture" element={<EyeCapture />} />
        <Route path="/voice-capture" element={<VoiceCapture />} />
        <Route path="/ai-processing" element={<AIProcessing />} />
        <Route path="/ai-summary" element={<AISummary />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/queue-token" element={<QueueToken />} />

        <Route path="/physician" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><PhysicianDashboard /></ProtectedRoute>} />
        <Route path="/physician/queue" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><ClinicalQueue /></ProtectedRoute>} />
        <Route path="/physician/routine" element={<Navigate to="/physician/queue" replace />} />
        <Route path="/physician/patients" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><ClinicalQueue /></ProtectedRoute>} />
        <Route path="/physician/assessments" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><AIDetails /></ProtectedRoute>} />
        <Route path="/physician/handoff" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><PhysicianHandoff /></ProtectedRoute>} />
        <Route path="/physician/ai-details" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><AIDetails /></ProtectedRoute>} />
        <Route path="/physician/encounter" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><Encounter /></ProtectedRoute>} />
        <Route path="/physician/prescription" element={<ProtectedRoute allow={["physician"]} loginPath="/login/doctor"><Prescription /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
        <Route path="/admin/dhis" element={<AdminGate><DHISPayout /></AdminGate>} />

        <Route path="/dispensary" element={<ProtectedRoute allow={["jan_aushadhi"]} loginPath="/login/jan-aushadhi"><Dispensary /></ProtectedRoute>} />
        <Route path="/mobile" element={<MobileApp />} />
        <Route path="/system-status" element={<AdminGate><SystemStatus /></AdminGate>} />

        <Route path="*" element={<Navigate to="/opd" replace />} />
      </Routes>
      </KioskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
