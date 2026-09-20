import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";
import { useTranslation } from "../../hooks/useTranslation";

type Stage = "number" | "otp" | "verified";

export default function AadhaarAuth() {
  const navigate = useNavigate();
  const { setIdentifier } = useKiosk();
  const [stage, setStage] = useState<Stage>("number");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const { t: heading } = useTranslation("Verify with Aadhaar");
  const { t: headingSub } = useTranslation("Verify your identity using Aadhaar");
  const { t: aadhaarLabel } = useTranslation("Aadhaar Number");
  const { t: sendOtpLabel } = useTranslation("Send OTP");
  const { t: enterOtpLabel } = useTranslation("Enter OTP");
  const { t: backLabel } = useTranslation("Back");
  const { t: verifyLabel } = useTranslation("Verify & Continue");
  const { t: identityVerified } = useTranslation("Identity Verified");
  const { t: fetchingRecords } = useTranslation("Fetching your linked health records…");
  const { t: privacyNote } = useTranslation(
    "Your Aadhaar number is used only for identity verification via UIDAI and is not stored."
  );

  const formattedAadhaar = aadhaar
    .replace(/\D/g, "")
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

  const sendOtp = () => {
    const digits = aadhaar.replace(/\D/g, "");
    if (digits.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setError("");
    setStage("otp");
  };

  const verifyOtp = () => {
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Please enter the 6-digit OTP sent to your registered mobile number.");
      return;
    }
    setError("");
    const digits = aadhaar.replace(/\D/g, "");
    setIdentifier(`XXXX-XXXX-${digits.slice(-4)}`);
    setStage("verified");
    setTimeout(() => navigate("/record-fetch"), 900);
  };

  return (
    <KioskLayout progress={33} step="Step 4 of 12 — Aadhaar Authentication" showBack backTo="/auth">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">{heading}</h2>
            <p className="text-lg text-slate-500">{headingSub}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            {stage === "number" && (
              <>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{aadhaarLabel}</label>
                <input
                  value={formattedAadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  inputMode="numeric"
                  className="w-full mt-2 text-2xl tracking-widest font-semibold text-navy-900 border-2 border-slate-200 focus:border-navy-500 rounded-xl px-4 py-4 outline-none transition-all"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-4">
                  <span>🔒</span>
                  {privacyNote}
                </div>
                <button
                  onClick={sendOtp}
                  className="w-full mt-6 bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold py-4 rounded-xl transition-all"
                >
                  {sendOtpLabel}
                </button>
              </>
            )}

            {stage === "otp" && (
              <>
                <p className="text-slate-600 mb-4">
                  An OTP has been sent to the mobile number linked with Aadhaar ending <strong>{aadhaar.replace(/\D/g, "").slice(-4)}</strong>.
                </p>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{enterOtpLabel}</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  inputMode="numeric"
                  className="w-full mt-2 text-2xl tracking-widest font-semibold text-navy-900 border-2 border-slate-200 focus:border-navy-500 rounded-xl px-4 py-4 outline-none transition-all"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStage("number")}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-700 text-base font-semibold py-4 rounded-xl transition-all"
                  >
                    {backLabel}
                  </button>
                  <button
                    onClick={verifyOtp}
                    className="flex-2 bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all"
                  >
                    {verifyLabel}
                  </button>
                </div>
              </>
            )}

            {stage === "verified" && (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-teal-700 mb-1">{identityVerified}</h3>
                <p className="text-slate-500">{fetchingRecords}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
