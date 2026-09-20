import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

export default function Authentication() {
  const navigate = useNavigate();
  const { setAuthMethod } = useKiosk();

  return (
    <KioskLayout
      progress={25}
      step="Step 3 of 12 — Authentication"
      showBack
      backTo="/data-consent"
      voicePrompt="Step 3: how would you like to register? Say 'ABHA' to use your digital health I D, or say 'Aadhaar' to register with your Aadhaar number."
      onVoiceCommand={(text) => {
        if (text.includes("abha")) { setAuthMethod("abha"); navigate("/qr-scan"); return true; }
        if (text.includes("aadhaar") || text.includes("adhar")) { setAuthMethod("aadhaar"); navigate("/aadhaar-auth"); return true; }
        return false;
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">How would you like to register?</h2>
            <p className="text-lg text-slate-500">आप कैसे पंजीकरण करना चाहेंगे?</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div
              onClick={() => { setAuthMethod("abha"); navigate("/qr-scan"); }}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-navy-400 p-8 cursor-pointer transition-all hover:shadow-xl group relative"
            >
              <div className="absolute top-4 right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Recommended
              </div>
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-navy-100 transition-all">
                <svg className="w-10 h-10 text-navy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3">ABHA / Digital Health ID</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Scan your ABHA QR code or enter your ABHA number to retrieve your digital health records.
              </p>
              <div className="space-y-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setAuthMethod("abha"); navigate("/qr-scan"); }}
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold py-4 rounded-xl transition-all"
                >
                  Scan QR Code
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setAuthMethod("abha"); navigate("/qr-scan"); }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-medium py-3 rounded-xl transition-all"
                >
                  Enter ABHA ID Manually
                </button>
              </div>
            </div>

            <div
              onClick={() => { setAuthMethod("aadhaar"); navigate("/aadhaar-auth"); }}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-400 p-8 cursor-pointer transition-all hover:shadow-xl group"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-all">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3">Aadhaar ID</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Register using your Aadhaar number. We'll verify your identity with OTP and fetch any digital health records linked to it.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-base">🔐</span>
                  Verified via OTP — UIDAI compliant
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                  <span className="text-base">📁</span>
                  Fetches linked health records automatically
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setAuthMethod("aadhaar"); navigate("/aadhaar-auth"); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-lg font-semibold py-4 rounded-xl transition-all"
              >
                Continue with Aadhaar
              </button>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
