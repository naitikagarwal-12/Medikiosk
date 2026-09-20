import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk, FetchedRecord } from "../../context/KioskContext";

const mockRecords: FetchedRecord[] = [
  { id: "rec-visits", label: "Previous visits", count: "4 records", icon: "🏥" },
  { id: "rec-diagnoses", label: "Diagnoses", count: "2 records", icon: "📋" },
  { id: "rec-medications", label: "Medications", count: "3 records", icon: "💊" },
  { id: "rec-labs", label: "Lab reports", count: "1 record", icon: "🧪" },
  { id: "rec-allergies", label: "Allergies", count: "None reported", icon: "⚠️" },
];

export default function RecordFetch() {
  const navigate = useNavigate();
  const { authMethod, setFetchedRecords, setSelectedRecordIds } = useKiosk();
  const [progress, setProgress] = useState(0);
  const [stepStates, setStepStates] = useState([true, false, false, false]);

  const sourceLabel = authMethod === "aadhaar" ? "Aadhaar-linked health records" : "ABHA authenticated";

  const steps = [
    { label: "Identity verified", done: true, delay: 0 },
    { label: sourceLabel, done: true, delay: 400 },
    { label: "Fetching available records", done: false, delay: 900 },
    { label: "Preparing patient history", done: false, delay: 2200 },
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStepStates([true, true, false, false]), 400));
    timers.push(setTimeout(() => setStepStates([true, true, true, false]), 900));
    timers.push(setTimeout(() => {
      setStepStates([true, true, true, true]);
      const recordsWithData = mockRecords.filter((r) => r.count !== "None reported");
      setFetchedRecords(mockRecords);
      setSelectedRecordIds(recordsWithData.map((r) => r.id));
    }, 2200));
    timers.push(setTimeout(() => navigate("/record-select"), 3400));

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(Math.min(p, 100));
      if (p >= 100) clearInterval(interval);
    }, 60);

    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  }, [navigate, setFetchedRecords, setSelectedRecordIds]);

  return (
    <KioskLayout progress={41} step="Step 5 of 12 — Fetching Records">
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-navy-700 spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-2">Fetching Your Digital Health Records</h2>
            <p className="text-slate-500 text-lg">
              Digital Health Locker — {authMethod === "aadhaar" ? "Aadhaar-linked ABHA" : "NHA Server"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="space-y-4 mb-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      stepStates[i]
                        ? "bg-teal-500 text-white"
                        : i === stepStates.filter(Boolean).length
                        ? "bg-navy-100 border-2 border-navy-400"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {stepStates[i] ? "✓" : i === stepStates.filter(Boolean).length ? (
                        <span className="progress-pulse text-navy-600">●</span>
                      ) : "○"}
                    </div>
                    <span className={`text-base font-medium ${stepStates[i] ? "text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-navy-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-slate-400 mt-2 text-right">{progress}%</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-slate-700">Digital Health Locker</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Only consented records are retrieved</p>
              {mockRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span>{r.icon}</span>
                    {r.label}
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Connecting to NHA server… Only available and consented records are retrieved.
          </p>
        </div>
      </div>
    </KioskLayout>
  );
}
