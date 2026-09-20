import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

const DATA_CATEGORIES = [
  {
    icon: "🪪",
    title: "Identity details",
    desc: "Your name, mobile number, and — if you choose ABHA or Aadhaar — your health ID / Aadhaar number and OTP used only to verify you.",
  },
  {
    icon: "📁",
    title: "Digital health records",
    desc: "Records linked to your ABHA ID or fetched with your consent, plus any documents you scan at the kiosk.",
  },
  {
    icon: "📝",
    title: "Symptom questionnaire",
    desc: "Your answers about symptoms, duration, and history, used to prioritise your visit.",
  },
  {
    icon: "👁",
    title: "Optional biometric assessment",
    desc: "Eye, tongue, and voice captures — only taken if you separately opt in later in the process.",
  },
  {
    icon: "🤖",
    title: "AI-generated summary",
    desc: "A preliminary assessment generated from the above, shared with your treating physician only.",
  },
];

const RIGHTS = [
  "Access a copy of the personal data the hospital holds about you.",
  "Ask for correction or erasure of inaccurate or unnecessary data.",
  "Withdraw this consent at any time by informing hospital staff.",
  "File a grievance with the hospital's Data Protection Officer / Grievance Officer.",
];

const VOICE_PROMPT =
  "This screen explains what information we collect and why, as required under India's data protection law. " +
  "Please check the box to agree to the terms and conditions, or say 'I agree' to consent. " +
  "If you'd rather not continue, say 'I do not agree' and you'll be taken back to the welcome screen.";

export default function DataConsent() {
  const navigate = useNavigate();
  const { reset } = useKiosk();
  const [checked, setChecked] = useState(false);
  const [attemptedWithoutConsent, setAttemptedWithoutConsent] = useState(false);

  const decline = () => {
    reset();
    navigate("/opd", { replace: true });
  };

  const handleContinue = () => {
    if (!checked) {
      setAttemptedWithoutConsent(true);
      return;
    }
    navigate("/auth");
  };

  return (
    <KioskLayout
      progress={16}
      step="Step 2 of 12 — Data Consent"
      showBack
      backTo="/language"
      voicePrompt={VOICE_PROMPT}
      onVoiceCommand={(text) => {
        if (/\b(do not agree|don't agree|disagree|decline|no)\b/.test(text)) {
          decline();
          return true;
        }
        if (/\b(i agree|agree|accept|yes|consent)\b/.test(text)) {
          setChecked(true);
          setAttemptedWithoutConsent(false);
          navigate("/auth");
          return true;
        }
        return false;
      }}
    >
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-2 rounded-full border border-teal-200 mb-4">
              <span className="text-teal-500">●</span> Digital Personal Data Protection (DPDP) Notice
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Your Data, Your Consent</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Before we register your visit, please review what information we'll collect and why — in line with
              India's Digital Personal Data Protection Act, 2023.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-navy-900 text-base mb-4">What we'll collect during this visit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DATA_CATEGORIES.map((c) => (
                <div key={c.title} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl leading-none">{c.icon}</div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">{c.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-navy-900 text-base mb-3">Purpose &amp; retention</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">
              This data is used solely to register your OPD visit, retrieve relevant health records, support your
              physician's assessment, and coordinate your care at this hospital. It is retained only as long as
              required for treatment and legal record-keeping, and is not shared with third parties for marketing.
            </p>
            <h3 className="font-bold text-navy-900 text-base mb-2 mt-4">Your rights</h3>
            <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
              {RIGHTS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <label
            className={`flex items-start gap-3 bg-white rounded-2xl border-2 p-5 mb-3 cursor-pointer transition-all ${
              checked
                ? "border-teal-400 bg-teal-50"
                : attemptedWithoutConsent
                ? "border-red-300 bg-red-50"
                : "border-slate-200 hover:border-teal-200"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);
                if (e.target.checked) setAttemptedWithoutConsent(false);
              }}
              className="mt-1 w-5 h-5 accent-teal-600 shrink-0"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              I have read and understood the above notice. I{" "}
              <strong>agree to the Terms &amp; Conditions</strong> and voluntarily consent to the collection and
              processing of my personal and health data as described, for the purpose of this OPD visit.
            </span>
          </label>

          {attemptedWithoutConsent && (
            <div className="text-center text-sm text-red-600 font-medium mb-4">
              Please check the box above to agree to the Terms &amp; Conditions before continuing.
            </div>
          )}

          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={handleContinue}
              className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              I Agree & Continue →
            </button>
            <button
              onClick={decline}
              className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 text-base font-medium px-8 py-4 rounded-2xl transition-all"
            >
              I Do Not Agree
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 max-w-xl mx-auto leading-relaxed">
            This notice is a plain-language summary provided for this kiosk demonstration and should be reviewed by
            the hospital's legal / compliance team before production use.
          </p>
        </div>
      </div>
    </KioskLayout>
  );
}
