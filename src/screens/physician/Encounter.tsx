import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

export default function Encounter() {
  const [notes, setNotes] = useState({
    chiefComplaint: "Fever and fatigue for 3 days, mild cough",
    history: "No significant past medical history. Self-medicated with Paracetamol 500mg.",
    aiSummary: "AI assessment flagged mild conjunctival pallor and tongue coating. Possible febrile illness with mild anaemia indicators.",
    examination: "",
    assessment: "",
    plan: "",
  });

  const handleChange = (field: keyof typeof notes, value: string) => {
    setNotes((n) => ({ ...n, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Encounter — Ananya Sharma / R-027</div>
            <h1 className="text-2xl font-bold text-navy-900">Clinical Encounter</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/physician/prescription" className="bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-800">
              Proceed to Prescription →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            {[
              { key: "chiefComplaint", label: "Chief Complaint", readonly: false, badge: "Patient reported" },
              { key: "history", label: "History", readonly: false, badge: "ABHA + AI-assisted" },
              { key: "aiSummary", label: "AI-Generated Summary", readonly: false, badge: "AI-assisted — editable" },
              { key: "examination", label: "Examination Findings", readonly: false, placeholder: "Enter physical examination findings…", badge: "Physician" },
              { key: "assessment", label: "Assessment / Diagnosis", readonly: false, placeholder: "Enter your clinical assessment…", badge: "Physician" },
              { key: "plan", label: "Treatment Plan", readonly: false, placeholder: "Treatment, investigations, follow-up…", badge: "Physician" },
            ].map((field) => (
              <div key={field.key} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-slate-700 text-sm">{field.label}</label>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    field.badge.includes("AI") ? "bg-orange-50 text-orange-600 border-orange-200" :
                    field.badge.includes("Physician") ? "bg-navy-50 text-navy-600 border-navy-200" :
                    "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>{field.badge}</span>
                </div>
                <textarea
                  value={(notes as Record<string, string>)[field.key]}
                  onChange={(e) => handleChange(field.key as keyof typeof notes, e.target.value)}
                  placeholder={(field as { placeholder?: string }).placeholder || ""}
                  rows={3}
                  className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-navy-400 focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-navy-900 text-white rounded-2xl p-5">
              <div className="font-bold mb-3">Ananya Sharma</div>
              <div className="text-sm text-slate-300 space-y-2">
                <div>34 years • Female</div>
                <div>OPD-2024-08432</div>
                <div className="text-orange-400 font-bold text-lg">R-027</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="font-semibold text-slate-700 mb-3 text-sm">Quick References</div>
              <div className="space-y-2 text-sm">
                <Link to="/physician/ai-details" className="flex items-center gap-2 text-navy-600 hover:text-navy-800 transition-all">
                  → AI Assessment Details
                </Link>
                <Link to="/physician/handoff" className="flex items-center gap-2 text-navy-600 hover:text-navy-800 transition-all">
                  → Handoff Summary
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="space-y-3">
                <button className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-sm transition-all">
                  Save Encounter
                </button>
                <Link
                  to="/physician/prescription"
                  className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl text-sm transition-all text-center"
                >
                  Create Prescription →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
