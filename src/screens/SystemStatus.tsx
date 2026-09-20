import { useState } from "react";
import { Link } from "react-router-dom";

const services = [
  { name: "Internet Connectivity", status: "connected", icon: "🌐" },
  { name: "ABHA / NHA Service", status: "available", icon: "🏥" },
  { name: "Edge OCR Engine", status: "available", icon: "📄" },
  { name: "Kiosk Camera", status: "ready", icon: "📷" },
  { name: "Kiosk Microphone", status: "ready", icon: "🎙" },
  { name: "AI Engine (Groq)", status: "available", icon: "🤖" },
  { name: "EMR Sync", status: "available", icon: "🔄" },
  { name: "Jan Aushadhi Integration", status: "available", icon: "💊" },
];

type StatusMode = "online" | "degraded" | "offline";

export default function SystemStatus() {
  const [mode, setMode] = useState<StatusMode>("online");

  const offlineServices = mode === "offline" ? ["Internet Connectivity", "ABHA / NHA Service", "AI Engine (Groq)", "EMR Sync"] : [];

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">MediKiosk System Status</h1>
            <p className="text-slate-500 text-sm mt-0.5">District Government Hospital — Kiosk Operational Monitor</p>
          </div>
          <Link to="/opd" className="text-sm text-navy-600 hover:text-navy-800 font-medium">← Kiosk Home</Link>
        </div>

        <div className="flex gap-2 mb-6">
          {(["online", "degraded", "offline"] as StatusMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                mode === m
                  ? m === "online" ? "bg-teal-500 text-white" : m === "degraded" ? "bg-orange-500 text-white" : "bg-red-500 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "offline" && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📡</span>
              <div className="font-bold text-orange-800 text-lg">Offline Mode Active</div>
            </div>
            <p className="text-orange-700 text-sm leading-relaxed">
              Patient registration and document capture can continue using the local kiosk network. Data will synchronize when connectivity is restored.
            </p>
          </div>
        )}

        {mode === "online" && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></span>
            <span className="font-semibold text-teal-700">All systems operational</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {services.map((service) => {
            const isDown = offlineServices.includes(service.name);
            const isDegraded = mode === "degraded" && ["AI Engine (Groq)", "EMR Sync"].includes(service.name);
            return (
              <div
                key={service.name}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 ${
                  isDown ? "border-red-200 bg-red-50" :
                  isDegraded ? "border-orange-200 bg-orange-50" :
                  "border-slate-200"
                }`}
              >
                <span className="text-2xl">{service.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-sm">{service.name}</div>
                  <div className={`text-xs font-bold mt-0.5 capitalize ${
                    isDown ? "text-red-600" : isDegraded ? "text-orange-600" : "text-teal-600"
                  }`}>
                    {isDown ? "Offline" : isDegraded ? "Degraded" : service.status}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  isDown ? "bg-red-500" : isDegraded ? "bg-orange-500 animate-pulse" : "bg-teal-500"
                }`}></div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Privacy & Consent Status</h3>
          {[
            { label: "Patient identity", status: "Active", type: "required" },
            { label: "Medical history (ABHA)", status: "Active", type: "required" },
            { label: "Questionnaire responses", status: "Active", type: "required" },
            { label: "Camera — Eye image", status: "Consented", type: "optional" },
            { label: "Camera — Tongue image", status: "Consented", type: "optional" },
            { label: "Microphone — Voice recording", status: "Consented", type: "optional" },
            { label: "AI-assisted assessment", status: "Consented", type: "optional" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.type === "required" ? "bg-navy-500" : "bg-purple-500"}`}></span>
                <span className="text-sm text-slate-700">{item.label}</span>
                {item.type === "optional" && <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                item.status === "Active" ? "bg-teal-100 text-teal-700" :
                item.status === "Consented" ? "bg-purple-100 text-purple-700" :
                "bg-slate-100 text-slate-500"
              }`}>{item.status}</span>
            </div>
          ))}
          <p className="text-xs text-slate-400 mt-4 italic">Patients remain in control of optional assessment inputs.</p>
        </div>
      </div>
    </div>
  );
}
