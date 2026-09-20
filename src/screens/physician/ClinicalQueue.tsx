import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const redQueue = [
  { token: "R-027", name: "Ananya Sharma", age: 34, complaint: "Fever + fatigue 3 days", flag: "Pallor observed", wait: "2 min", aiSummary: "Possible anaemia indicators" },
  { token: "R-028", name: "Rajesh Kumar", age: 58, complaint: "Chest tightness + shortness of breath", flag: "Respiratory", wait: "5 min", aiSummary: "Respiratory distress indicators" },
  { token: "R-029", name: "Priya Singh", age: 27, complaint: "Severe headache + vomiting", flag: "Neurological", wait: "8 min", aiSummary: "High-severity headache pattern" },
];

const whiteQueue = [
  { token: "A-140", name: "Mohan Das", age: 45, complaint: "Cough for 1 week", ewt: "12 min", aiSummary: "Mild URI pattern" },
  { token: "A-141", name: "Sunita Rao", age: 62, complaint: "Knee pain", ewt: "14 min", aiSummary: "Musculoskeletal complaint" },
  { token: "A-142", name: "Ananya Sharma", age: 34, complaint: "Fever + fatigue", ewt: "18 min", aiSummary: "Febrile illness, moderate severity" },
  { token: "A-143", name: "Vikram Patel", age: 29, complaint: "Skin rash", ewt: "21 min", aiSummary: "Dermatological complaint" },
  { token: "A-144", name: "Kavita Joshi", age: 41, complaint: "Acidity / heartburn", ewt: "24 min", aiSummary: "GERD pattern likely" },
  { token: "A-145", name: "Arjun Reddy", age: 53, complaint: "Weakness + dizziness", ewt: "27 min", aiSummary: "Possible electrolyte concern" },
];

export default function ClinicalQueue() {
  const [tab, setTab] = useState<"all" | "red" | "white">("all");

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Waiting Queue</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time OPD patient queue — AI triaged. Filter by red (priority) or green (routine).</p>
          </div>
          <div className="flex gap-2">
            {(["all", "red", "white"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  tab === t
                    ? t === "red" ? "bg-red-500 text-white" : t === "white" ? "bg-teal-500 text-white" : "bg-navy-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "all" ? "All" : t === "red" ? `🔴 Red — Priority (${redQueue.length})` : `🟢 Green — Routine (${whiteQueue.length})`}
              </button>
            ))}
          </div>
        </div>

        {(tab === "all" || tab === "red") && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <h2 className="font-bold text-red-700 text-lg uppercase tracking-wide">Red Queue — Priority</h2>
              </div>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{redQueue.length} patients</span>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    {["Token", "Patient", "Age", "Main Complaint", "Red Flag", "Wait", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-red-700 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {redQueue.map((p, i) => (
                    <tr key={p.token} className={`border-b border-red-50 hover:bg-red-50/50 transition-all ${i === 0 ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 font-black text-red-600 text-base">{p.token}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{p.age}y</td>
                      <td className="px-4 py-3 text-slate-700 text-sm max-w-xs">{p.complaint}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">{p.flag}</span>
                      </td>
                      <td className="px-4 py-3 text-red-600 font-bold text-sm">{p.wait}</td>
                      <td className="px-4 py-3">
                        <Link
                          to="/physician/handoff"
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                        >
                          Open Case →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(tab === "all" || tab === "white") && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-bold text-teal-700 text-lg uppercase tracking-wide">Green Queue — Routine</h2>
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">{whiteQueue.length} patients</span>
            </div>
            <div className="bg-white rounded-2xl border border-teal-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-teal-50 border-b border-teal-100">
                  <tr>
                    {["Token", "Patient", "Complaint", "EWT", "AI Summary", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-teal-700 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {whiteQueue.map((p) => (
                    <tr key={p.token} className="border-b border-teal-50 hover:bg-teal-50/30 transition-all">
                      <td className="px-4 py-3 font-black text-teal-600">{p.token}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.name} <span className="font-normal text-slate-400 text-sm">{p.age}y</span></td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{p.complaint}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm font-medium">{p.ewt}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full border border-orange-100">
                          AI: {p.aiSummary}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/physician/handoff"
                          className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
