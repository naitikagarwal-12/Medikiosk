import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";

export default function Consent() {
  const navigate = useNavigate();
  const [consented, setConsented] = useState({ eye: false, tongue: false, voice: false });

  const allConsented = consented.eye && consented.tongue && consented.voice;

  return (
    <KioskLayout
      progress={87}
      step="Step 10 of 12 — Consent for AI Assessment"
      showBack
      backTo="/questionnaire"
      voicePrompt="Step 10: this optional assessment looks at your eyes, tongue, and voice to help the doctor. Say 'I agree' if you consent to all three, or you can tap each option yourself."
      onVoiceCommand={(text) => {
        if (/\b(i agree|agree|yes|consent)\b/.test(text)) {
          setConsented({ eye: true, tongue: true, voice: true });
          return true;
        }
        return false;
      }}
    >
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-semibold px-4 py-2 rounded-full border border-purple-200 mb-4">
              <span className="text-purple-500">●</span> Optional Clinical Assessment
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Optional Clinical Assessment</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              The kiosk can capture images of your eyes and tongue and a short voice recording to generate an AI-assisted preliminary assessment.
              These observations are intended to support the clinician and <strong>do not replace medical examination</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              {
                key: "eye",
                icon: "👁",
                title: "Eye Image",
                desc: "Visible features such as redness, pallor, dryness or discoloration.",
                ayurvedic: "Drik Pariksha",
              },
              {
                key: "tongue",
                icon: "👅",
                title: "Tongue Image",
                desc: "Coating, color, cracks, moisture and shape.",
                ayurvedic: "Jihva Pariksha",
              },
              {
                key: "voice",
                icon: "🎙",
                title: "Voice Recording",
                desc: "Voice quality, pitch, speech characteristics and hoarseness.",
                ayurvedic: "Shabda Pariksha",
              },
            ].map((item) => {
              const key = item.key as keyof typeof consented;
              return (
                <div
                  key={key}
                  onClick={() => setConsented((c) => ({ ...c, [key]: !c[key] }))}
                  className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                    consented[key]
                      ? "border-purple-400 bg-purple-50 shadow-md"
                      : "border-slate-200 hover:border-purple-200"
                  }`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-navy-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">{item.desc}</p>
                  <div className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded inline-block">
                    {item.ayurvedic}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${consented[key] ? "bg-purple-600 border-purple-600" : "border-slate-300"}`}>
                      {consented[key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-medium ${consented[key] ? "text-purple-700" : "text-slate-500"}`}>
                      {consented[key] ? "Consent given" : "Tap to consent"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            🔒 Your consent is required before using camera or microphone.
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/ashtavidha")}
              disabled={!allConsented}
              className="bg-navy-900 hover:bg-navy-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              I Consent & Continue →
            </button>
            <button
              onClick={() => navigate("/ai-processing")}
              className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 text-base font-medium px-8 py-4 rounded-2xl transition-all"
            >
              Skip This Assessment
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
