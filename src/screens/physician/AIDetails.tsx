import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const tabs = ["Symptoms", "Medical History", "Tongue", "Eye", "Voice", "Questionnaire", "OCR Records"];

const tabContent: Record<string, { observation: string; source: string; confidence: string; note: string }[]> = {
  Tongue: [
    { observation: "Coating: White coating present on dorsum", source: "Tongue image — AI analysis", confidence: "Moderate (72%)", note: "AI observation: Tongue coating may indicate digestive involvement. Requires clinical assessment." },
    { observation: "Color: Pale-red, slightly pallid", source: "Tongue image — AI analysis", confidence: "Moderate (68%)", note: "Pallor on tongue may correlate with conjunctival pallor. Clinician should verify." },
    { observation: "Moisture: Mildly dry", source: "Tongue image — AI analysis", confidence: "Low-Moderate (61%)", note: "Possible mild dehydration or systemic illness. Not conclusive." },
  ],
  Eye: [
    { observation: "Conjunctival pallor: Mild bilateral pallor observed", source: "Eye image — AI analysis", confidence: "Moderate (69%)", note: "Possible anaemia indicator. Requires haematological investigation and clinical examination." },
    { observation: "Scleral redness: Mild bilateral redness", source: "Eye image — AI analysis", confidence: "High (81%)", note: "May indicate fatigue, mild infection, or environmental irritation. Clinical context required." },
  ],
  Voice: [
    { observation: "Quality: Slightly weak voice", source: "Voice recording — AI analysis", confidence: "Low-Moderate (58%)", note: "Weakness in voice may indicate respiratory involvement or systemic debility. Confidence is moderate." },
    { observation: "Hoarseness: Mild", source: "Voice recording — AI analysis", confidence: "Low (52%)", note: "Mild hoarseness noted. May be related to cough. Low confidence — clinical assessment required." },
  ],
  Symptoms: [
    { observation: "Fever: Present, 3 days duration", source: "Patient questionnaire", confidence: "Patient reported", note: "Self-reported symptom — no AI inference." },
    { observation: "Fatigue: Moderate severity", source: "Patient questionnaire", confidence: "Patient reported", note: "Patient rates severity as moderate — affecting daily routine." },
  ],
  "Medical History": [
    { observation: "No chronic conditions known", source: "ABHA Digital Health Locker", confidence: "ABHA verified", note: "Records retrieved from Digital Health Locker via ABHA." },
  ],
  Questionnaire: [
    { observation: "Digestion: Mild acidity and reduced appetite", source: "Patient questionnaire", confidence: "Patient reported", note: "Patient-provided answers to standardized symptom questionnaire." },
  ],
  "OCR Records": [
    { observation: "Previous prescription: Paracetamol 500mg (March 2024)", source: "Edge OCR from paper record", confidence: "OCR extracted (88%)", note: "Extracted via Edge OCR during walk-in registration. Should be verified with patient." },
  ],
};

export default function AIDetails() {
  const [activeTab, setActiveTab] = useState("Tongue");

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Ananya Sharma / R-027</div>
            <h1 className="text-2xl font-bold text-navy-900">AI Assessment Details</h1>
          </div>
          <div className="flex gap-3">
            <div className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-200 font-semibold">
              AI-assisted
            </div>
            <Link to="/physician/handoff" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200">
              ← Back to Handoff
            </Link>
            <Link to="/physician/encounter" className="bg-navy-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-navy-800">
              Start Encounter →
            </Link>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-700">
          <strong>Advisory:</strong> AI output is advisory only and must be clinically verified. The physician must review, edit, or reject AI-generated information before clinical use.
        </div>

        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {(tabContent[activeTab] || []).map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Observation</div>
                  <div className="font-semibold text-navy-900 text-sm">{item.observation}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Source</div>
                  <div className="text-sm text-slate-600">{item.source}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Confidence</div>
                  <div className={`text-sm font-semibold ${
                    item.confidence.startsWith("High") ? "text-teal-600" :
                    item.confidence.startsWith("Moderate") ? "text-orange-500" :
                    item.confidence.startsWith("Low") ? "text-red-500" : "text-slate-600"
                  }`}>{item.confidence}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Clinical Note</div>
                  <div className="text-xs text-slate-500 italic leading-relaxed">{item.note}</div>
                </div>
              </div>
            </div>
          ))}
          {!tabContent[activeTab]?.length && (
            <div className="text-center text-slate-400 py-12">No observations for this category.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
