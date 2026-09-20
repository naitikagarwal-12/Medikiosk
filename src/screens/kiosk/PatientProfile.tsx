import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

export default function PatientProfile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const { authMethod, identifier, fetchedRecords, selectedRecordIds, uploadedDocuments } = useKiosk();

  const idLabel = authMethod === "aadhaar" ? "Aadhaar ID" : "ABHA ID";
  const idValue = authMethod === "aadhaar" && identifier ? identifier : "9876-5432-1098-7654";
  const selectedRecords = fetchedRecords.filter((r) => selectedRecordIds.includes(r.id));

  return (
    <KioskLayout progress={66} step="Step 8 of 12 — Confirm Your Details" showBack backTo="/scan-documents">
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">Confirm Your Details</h2>
            <p className="text-slate-500 text-lg">अपना विवरण सत्यापित करें</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-navy-900 px-8 py-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-navy-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                AS
              </div>
              <div>
                <div className="text-white text-2xl font-bold">Ananya Sharma</div>
                <div className="text-slate-300 text-sm">{idLabel}: {idValue}</div>
              </div>
              <div className="ml-auto">
                <span className="bg-teal-500/20 text-teal-300 text-sm px-3 py-1 rounded-full border border-teal-500/30">
                  Identity Verified ✓
                </span>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Full Name", value: "Ananya Sharma", editable: true },
                  { label: "Age", value: "34 years", editable: true },
                  { label: "Gender", value: "Female", editable: false },
                  { label: "Mobile Number", value: "98XXX-XX432", editable: true },
                  { label: idLabel, value: idValue, editable: false },
                  { label: "Registration ID", value: "OPD-2024-08432", editable: false },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{field.label}</label>
                    <div className={`mt-1 text-base font-medium ${editing && field.editable ? "bg-slate-50 border border-navy-300 rounded-lg px-3 py-2" : "text-slate-800"}`}>
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Records Included Today</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedRecords.length > 0 ? (
                    selectedRecords.map((r) => (
                      <span key={r.id} className="bg-navy-50 text-navy-700 text-sm px-3 py-1.5 rounded-full border border-navy-200">
                        {r.icon} {r.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">No health-locker records selected</span>
                  )}
                  {uploadedDocuments.map((d) => (
                    <span key={d.id} className="bg-teal-50 text-teal-700 text-sm px-3 py-1.5 rounded-full border border-teal-200">
                      📄 {d.category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Previous OPD Visits</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { date: "12 Mar 2024", dept: "General Medicine", complaint: "Fever" },
                    { date: "5 Jan 2024", dept: "ENT", complaint: "Throat pain" },
                    { date: "Oct 2023", dept: "General Medicine", complaint: "Viral fever" },
                  ].map((visit) => (
                    <div key={visit.date} className="bg-slate-50 rounded-xl p-3 text-sm">
                      <div className="font-medium text-slate-700">{visit.date}</div>
                      <div className="text-slate-500">{visit.dept}</div>
                      <div className="text-xs text-slate-400 mt-1">{visit.complaint}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button
                onClick={() => setEditing(!editing)}
                className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-base font-semibold py-4 rounded-xl transition-all"
              >
                {editing ? "Save Changes" : "Edit Details"}
              </button>
              <button
                onClick={() => navigate("/questionnaire")}
                className="flex-2 bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-lg transition-all active:scale-95"
              >
                Details are Correct →
              </button>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
