import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const defaultMeds = [
  { medicine: "Paracetamol", strength: "500 mg", dosage: "1 tablet", frequency: "Twice daily", duration: "3 days", instructions: "Take after food" },
  { medicine: "Cetirizine", strength: "10 mg", dosage: "1 tablet", frequency: "Once at night", duration: "5 days", instructions: "May cause drowsiness" },
];

export default function Prescription() {
  const [meds, setMeds] = useState(defaultMeds);
  const [sent, setSent] = useState(false);
  const [notes, setNotes] = useState("Take adequate rest. Maintain hydration. Return if fever persists beyond 2 days or worsens.");

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Ananya Sharma / R-027 / OPD-2024-08432</div>
            <h1 className="text-2xl font-bold text-navy-900">Create Prescription</h1>
          </div>
          <div className="flex gap-3">
            {sent ? (
              <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 font-semibold text-sm">
                ✓ Sent to Jan Aushadhi
              </div>
            ) : (
              <button
                onClick={() => setSent(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Send to Jan Aushadhi →
              </button>
            )}
            <button className="bg-navy-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
              Save Prescription
            </button>
          </div>
        </div>

        <div className="bg-navy-900 text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center font-bold">AS</div>
            <div>
              <div className="font-bold text-lg">Ananya Sharma</div>
              <div className="text-slate-300 text-sm">34 years • OPD-2024-08432</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-300 text-xs">Prescribing physician</div>
            <div className="font-bold">Dr. R. Sharma</div>
            <div className="text-slate-300 text-sm">MBBS, MD General Medicine</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Medications</h3>
            <button
              onClick={() => setMeds((m) => [...m, { medicine: "", strength: "", dosage: "", frequency: "", duration: "", instructions: "" }])}
              className="text-navy-600 text-sm font-medium hover:text-navy-800"
            >
              + Add Medicine
            </button>
          </div>
          <table className="w-full">
            <thead className="border-b border-slate-100">
              <tr>
                {["Medicine", "Strength", "Dosage", "Frequency", "Duration", "Instructions", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meds.map((med, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                  {(["medicine", "strength", "dosage", "frequency", "duration", "instructions"] as const).map((field) => (
                    <td key={field} className="px-3 py-2">
                      <input
                        value={med[field]}
                        onChange={(e) => {
                          const updated = [...meds];
                          updated[i] = { ...updated[i], [field]: e.target.value };
                          setMeds(updated);
                        }}
                        className="w-full text-sm text-slate-700 bg-transparent border-b border-transparent focus:border-navy-300 focus:outline-none py-1 min-w-20"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <button onClick={() => setMeds((m) => m.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-lg">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <label className="text-sm font-semibold text-slate-700 block mb-2">Patient Instructions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-navy-400 transition-all"
          />
        </div>

        {sent && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-teal-700">Prescription sent to Jan Aushadhi Dispensary</div>
              <div className="text-sm text-teal-600">Patient will be notified. Dispensary has received the prescription for Token A-142.</div>
            </div>
            <Link to="/dispensary" className="ml-auto bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700">
              View Dispensary →
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
