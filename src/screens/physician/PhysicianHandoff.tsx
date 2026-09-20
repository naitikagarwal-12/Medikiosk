import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

export default function PhysicianHandoff() {
  const [expanded, setExpanded] = useState(false);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full border border-orange-200 uppercase tracking-wider">
                ⚡ 15-Second Clinical Handoff
              </span>
              <span className="text-xs text-slate-400">AI-generated • Requires physician verification</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-900">Patient Clinical Briefing</h1>
          </div>
          <Link
            to="/physician/encounter"
            className="bg-navy-900 hover:bg-navy-800 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
          >
            Review & Accept Encounter →
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="bg-navy-900 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center font-bold text-lg">AS</div>
                <div>
                  <div className="font-bold text-lg">Ananya Sharma</div>
                  <div className="text-slate-300 text-sm">34 years • Female</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-400 text-xs">Patient ID</div>
                  <div className="font-medium">OPD-2024-08432</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Queue Token</div>
                  <div className="font-bold text-orange-400 text-lg">R-027</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-navy-200 p-5">
              <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-2">Chief Complaint</div>
              <div className="text-2xl font-bold text-navy-900">Fever — 3 days</div>
              <div className="text-slate-500 mt-1 text-sm">With fatigue and mild cough. Reduced appetite.</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Fever", "Fatigue", "Mild cough"].map((s) => (
                  <span key={s} className="bg-navy-50 text-navy-700 text-xs px-2.5 py-1 rounded-full border border-navy-200">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">⚠ Clinical Attention Recommended</div>
              <div className="space-y-1.5 text-sm">
                {["Conjunctival pallor observed (AI)", "Persistent fever > 3 days", "Fatigue with reduced appetite"].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-red-700">
                    <span className="mt-0.5 shrink-0">●</span>
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-400 italic">AI-flagged for clinician attention — not independent diagnoses</div>
            </div>
          </div>

          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-slate-700">AI Summary</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">AI-assisted</span>
                  <span className="text-slate-400">Not a diagnosis</span>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                34-year-old female presenting with 3 days of fever, fatigue, and mild cough. Questionnaire indicates moderate severity, reduced appetite, and mild digestive discomfort. AI assessment flagged possible pallor (tongue and conjunctival observations). Voice indicators suggest mild respiratory involvement. No severe red-flag symptoms detected, but pattern warrants clinical evaluation for possible anaemia or infectious aetiology.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "👅", label: "Tongue", items: ["White coating: Present", "Pallor: Mild", "Dryness: Yes"] },
                { icon: "👁", label: "Eyes", items: ["Conjunctival pallor: Mild", "Redness: Mild bilateral", "Dryness: Mild"] },
                { icon: "🎙", label: "Voice", items: ["Quality: Slightly weak", "Hoarseness: Mild", "Pitch: Normal"] },
              ].map((obs) => (
                <div key={obs.label} className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{obs.icon}</span>
                    <span className="text-xs font-bold text-purple-700">{obs.label}</span>
                  </div>
                  {obs.items.map((item) => (
                    <div key={item} className="text-xs text-slate-600 py-1 border-b border-purple-100 last:border-0">{item}</div>
                  ))}
                  <div className="text-xs text-orange-500 mt-2">AI-assisted</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="font-semibold text-slate-700 mb-3 text-sm">Relevant History</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Previous Medication</div>
                  <div className="text-slate-700">Paracetamol 500mg (self-administered)</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Existing Conditions</div>
                  <div className="text-slate-700">None known</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Allergies</div>
                  <div className="text-slate-700">None reported</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Data Source</div>
                  <div className="text-slate-700">ABHA Digital Health Locker</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-left bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-navy-600 hover:border-navy-300 transition-all"
            >
              {expanded ? "▲" : "▼"} View Full AI Assessment Details
            </button>

            {expanded && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm">
                <Link to="/physician/ai-details" className="text-navy-600 hover:text-navy-800 font-medium">
                  → Open Full AI Assessment Details Panel
                </Link>
                <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  All AI observations are advisory and must be clinically verified. The physician remains the final decision-maker.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
