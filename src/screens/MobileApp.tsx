import { useState } from "react";
import { Link } from "react-router-dom";

const tabs = ["Dashboard", "Token", "Summary", "Prescription", "Alerts"];

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-navy-900">Patient Mobile App</h2>
          <p className="text-sm text-slate-500">Companion app for MediKiosk</p>
          <Link to="/opd" className="text-xs text-navy-600 hover:text-navy-800 mt-1 inline-block">← Back to Kiosk</Link>
        </div>

        <div className="bg-navy-900 rounded-[3rem] p-2 shadow-2xl">
          <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden">
            <div className="bg-navy-900 px-6 pt-4 pb-3">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white text-xs font-medium">9:41 AM</div>
                <div className="flex gap-1">
                  <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                  <div className="w-1.5 h-2 bg-white/40 rounded-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-300 text-xs">Hello,</div>
                  <div className="text-white font-bold text-lg">Ananya Sharma</div>
                </div>
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center text-white font-bold">
                  AS
                </div>
              </div>
            </div>

            <div className="px-4 py-4 min-h-96">
              {activeTab === "Dashboard" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Today's Visit</div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-3xl font-black text-teal-600">A-142</div>
                        <div className="text-xs text-slate-500">Token Number</div>
                      </div>
                      <div className="text-right">
                        <div className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">Waiting</div>
                        <div className="text-xs text-slate-500 mt-1">Position: 6th</div>
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-lg">⏱</span>
                      <div>
                        <div className="text-sm font-bold text-teal-700">Est. wait: 18 min</div>
                        <div className="text-xs text-teal-600">OPD Room 4 • Dr. R. Sharma</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
                    <div className="text-xs font-bold text-orange-600 uppercase mb-2">Medication Alert</div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💊</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-sm">Paracetamol 500mg</div>
                        <div className="text-xs text-slate-500">Next dose: 8:00 PM</div>
                      </div>
                      <button className="bg-navy-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                        Mark taken
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["Prescription", "Summary"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className="bg-white rounded-xl p-3 border border-slate-200 text-sm font-semibold text-navy-700 hover:border-navy-300 transition-all text-center"
                      >
                        {t === "Prescription" ? "📋 " : "📄 "}{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Summary" && (
                <div className="space-y-3">
                  <div className="bg-navy-900 rounded-2xl p-4 text-white">
                    <div className="text-xs text-slate-300 mb-1">Your Visit — 4 Sep 2024</div>
                    <div className="font-bold">Dr. R. Sharma, OPD Room 4</div>
                  </div>
                  {[
                    { label: "Symptoms", value: "Fever, fatigue, mild cough — 3 days" },
                    { label: "Doctor's Assessment", value: "Viral fever with possible mild anaemia. Recommended blood test." },
                    { label: "Follow-up", value: "Return in 3 days if symptoms persist" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">{item.label}</div>
                      <div className="text-sm text-slate-700">{item.value}</div>
                    </div>
                  ))}
                  <button className="w-full bg-navy-900 text-white font-semibold py-3 rounded-xl text-sm">
                    Download / View Summary
                  </button>
                </div>
              )}

              {activeTab === "Prescription" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-navy-900 text-white px-4 py-3">
                      <div className="font-bold text-sm">Prescription</div>
                      <div className="text-slate-300 text-xs">Dr. R. Sharma • 4 Sep 2024</div>
                    </div>
                    {[
                      { med: "Paracetamol 500mg", freq: "Twice daily", dur: "3 days", inst: "After food" },
                      { med: "Cetirizine 10mg", freq: "Once at night", dur: "5 days", inst: "May cause drowsiness" },
                    ].map((m) => (
                      <div key={m.med} className="p-4 border-b border-slate-100 last:border-0">
                        <div className="font-semibold text-slate-800 text-sm">{m.med}</div>
                        <div className="text-xs text-slate-500 mt-1">{m.freq} • {m.dur} • {m.inst}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Alerts" && (
                <div className="space-y-3">
                  {[
                    { med: "Paracetamol 500mg", time: "8:00 PM", done: false },
                    { med: "Cetirizine 10mg", time: "10:00 PM", done: false },
                    { med: "Paracetamol 500mg", time: "8:00 AM (yesterday)", done: true },
                  ].map((alert, i) => (
                    <div key={i} className={`bg-white rounded-xl p-4 border ${alert.done ? "border-slate-100 opacity-60" : "border-orange-200"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💊</span>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 text-sm">{alert.med}</div>
                          <div className="text-xs text-slate-500">{alert.time}</div>
                        </div>
                        {alert.done ? (
                          <span className="text-teal-500 text-xs font-semibold">✓ Taken</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">Upcoming</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Token" && (
                <div className="text-center pt-4">
                  <div className="bg-white rounded-2xl border border-teal-200 p-8 shadow-sm">
                    <div className="text-xs font-bold text-teal-600 uppercase mb-2">WHITE QUEUE</div>
                    <div className="text-6xl font-black text-teal-600 mb-3">A-142</div>
                    <div className="bg-teal-50 rounded-xl p-3">
                      <div className="text-sm font-bold text-teal-700">Estimated wait: 18 min</div>
                      <div className="text-xs text-teal-600 mt-1">Current: A-136 • OPD Room 4</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border-t border-slate-200 px-2 py-3 flex items-center justify-around">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                    activeTab === tab ? "text-navy-700" : "text-slate-400"
                  }`}
                >
                  <span className="text-sm">
                    {tab === "Dashboard" ? "🏠" : tab === "Token" ? "🎫" : tab === "Summary" ? "📄" : tab === "Prescription" ? "💊" : "🔔"}
                  </span>
                  <span className="text-xs font-medium leading-none">{tab}</span>
                  {activeTab === tab && <div className="w-1 h-1 bg-navy-700 rounded-full mt-0.5"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
