import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

const inputs = [
  { label: "Patient information", icon: "👤", done: true },
  { label: "Questionnaire", icon: "📋", done: true },
  { label: "Previous records", icon: "📁", done: true },
  { label: "Tongue observation", icon: "👅", done: true },
  { label: "Eye observation", icon: "👁", done: true },
  { label: "Voice observation", icon: "🎙", done: true },
  { label: "Generating clinical summary", icon: "🤖", done: false },
];

export default function AIProcessing() {
  const navigate = useNavigate();
  const { computeTriage } = useKiosk();
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    let item = 0;
    const advance = () => {
      if (item >= inputs.length) {
        computeTriage();
        setTimeout(() => navigate("/ai-summary"), 400);
        return;
      }
      setCurrentItem(item);
      item++;
      setTimeout(advance, 500);
    };
    setTimeout(advance, 300);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.5, 100));
    }, 50);
    return () => clearInterval(interval);
  }, [navigate, computeTriage]);

  return (
    <KioskLayout progress={100} step="Step 12 of 12 — AI Assessment">
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200 mb-4">
              <span className="progress-pulse">●</span> AI Processing
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-2">Preparing Your Preliminary Assessment</h2>
            <p className="text-slate-500">Multimodal AI Engine — Groq</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="font-semibold text-slate-700 mb-4">Processing inputs</div>
              <div className="space-y-3">
                {inputs.map((input, i) => {
                  const isDone = i < currentItem;
                  const isActive = i === currentItem;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                        isDone ? "bg-teal-500 text-white" : isActive ? "bg-orange-100 border-2 border-orange-400" : "bg-slate-100"
                      }`}>
                        {isDone ? "✓" : isActive ? <span className="progress-pulse text-orange-500 text-xs">●</span> : <span className="text-slate-400 text-xs">{i + 1}</span>}
                      </div>
                      <span className={`text-sm font-medium ${isDone ? "text-slate-700" : isActive ? "text-orange-600" : "text-slate-400"}`}>
                        {input.icon} {input.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-navy-900 rounded-2xl p-6 text-white">
              <div className="text-sm font-semibold text-slate-300 mb-4">Multimodal AI Engine</div>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Eye Image", color: "text-blue-300" },
                  { label: "Tongue Image", color: "text-red-300" },
                  { label: "Voice Recording", color: "text-green-300" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                    <div className="flex-1 h-px bg-navy-700">
                      <div className="h-full bg-gradient-to-r from-transparent to-orange-400 animate-pulse" />
                    </div>
                    <span className="text-orange-400 text-xs">→</span>
                  </div>
                ))}
              </div>
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
                <div className="text-orange-300 font-bold text-sm progress-pulse">GROQ Multimodal AI</div>
                <div className="text-xs text-slate-400 mt-1">Generating clinical summary…</div>
              </div>
              <div className="mt-4 h-2 bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-right text-xs text-slate-400 mt-1">{Math.round(progress)}%</div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <span className="text-orange-500">⚡</span>
              AI-assisted • Clinician reviewed • Not a final diagnosis
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
