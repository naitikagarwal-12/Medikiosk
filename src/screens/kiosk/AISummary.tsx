import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

export default function AISummary() {
  const navigate = useNavigate();
  const { triageResult } = useKiosk();
  const queueToken = triageResult?.queue === "red" ? "R-027" : "A-142";

  return (
    <KioskLayout progress={95} step="Assessment Complete — Review">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200 mb-3">
              AI-assisted • Not a diagnosis
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-1">Preliminary Assessment</h2>
            <p className="text-slate-500">For clinician review — AI-generated observations</p>
          </div>

          <div className="bg-navy-900 rounded-2xl p-5 text-white mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center font-bold text-lg">AS</div>
              <div>
                <div className="font-bold text-lg">Ananya Sharma</div>
                <div className="text-slate-300 text-sm">34 years • Female • ABHA: XXXX-1098</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Queue Token</div>
              <div className="text-2xl font-bold text-orange-400">{queueToken}</div>
              <div className="text-xs text-slate-300">Pending triage</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
            <div className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">Chief Complaint</div>
            <div className="text-xl font-bold text-navy-900">Fever and fatigue — 3 days</div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Fever", "Fatigue", "Mild cough", "Reduced appetite"].map((s) => (
                <span key={s} className="bg-navy-50 text-navy-700 text-sm px-3 py-1 rounded-full border border-navy-200">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              {
                icon: "👅",
                title: "Jihva / Tongue",
                fields: [
                  { label: "Coating", value: "Present — mild white" },
                  { label: "Color", value: "Pale-red" },
                  { label: "Moisture", value: "Slightly dry" },
                  { label: "Shape", value: "Normal" },
                ],
                confidence: "Moderate",
              },
              {
                icon: "👁",
                title: "Drik / Eyes",
                fields: [
                  { label: "Redness", value: "Mild bilateral" },
                  { label: "Pallor", value: "Slight conjunctival pallor" },
                  { label: "Dryness", value: "Mild" },
                ],
                confidence: "Moderate",
              },
              {
                icon: "🎙",
                title: "Shabda / Voice",
                fields: [
                  { label: "Quality", value: "Slightly weak" },
                  { label: "Pitch", value: "Normal range" },
                  { label: "Hoarseness", value: "Mild" },
                ],
                confidence: "Low–Moderate",
              },
            ].map((obs) => (
              <div key={obs.title} className="bg-white rounded-2xl border border-purple-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{obs.icon}</span>
                    <span className="font-semibold text-navy-900 text-sm">{obs.title}</span>
                  </div>
                  <div className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-200">AI-assisted</div>
                </div>
                {obs.fields.map((f) => (
                  <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-500">{f.label}</span>
                    <span className="text-xs font-medium text-slate-700">{f.value}</span>
                  </div>
                ))}
                <div className="mt-3 text-xs text-slate-400">
                  Confidence: <span className="text-orange-500 font-medium">{obs.confidence}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
            <strong>Important:</strong> These are AI-generated observations for clinician review only. They do not constitute a diagnosis. The physician will review and verify all findings.
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/triage")}
              className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              Proceed to Triage →
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
