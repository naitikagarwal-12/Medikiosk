import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";

const items = [
  { name: "NADI", label: "Pulse", pos: "top", kiosk: false, angle: 270 },
  { name: "MUTRA", label: "Urine", pos: "right-upper", kiosk: false, angle: 330 },
  { name: "MALA", label: "Stool", pos: "right-lower", kiosk: false, angle: 30 },
  { name: "AKRUTI", label: "Appearance", pos: "bottom", kiosk: false, angle: 90 },
  { name: "SPARSHA", label: "Touch", pos: "left-lower", kiosk: false, angle: 150 },
  { name: "SHABDA", label: "Voice", pos: "left-upper-2", kiosk: true, angle: 210 },
  { name: "DRIK", label: "Eyes", pos: "left-upper", kiosk: true, angle: 240 },
  { name: "JIHVA", label: "Tongue", pos: "center-left", kiosk: true, angle: 300 },
];

const kioskItems = [
  { icon: "👅", name: "Jihva", label: "Tongue", path: "/tongue-capture", ready: true },
  { icon: "👁", name: "Drik", label: "Eyes", path: "/eye-capture", ready: true },
  { icon: "🎙", name: "Shabda", label: "Voice", path: "/voice-capture", ready: true },
];

export default function AshtavidhaPariksha() {
  const navigate = useNavigate();

  return (
    <KioskLayout progress={93} step="Step 11 of 12 — Ashtavidha Pariksha" showBack backTo="/consent">
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200 mb-3">
              <span>✦</span> Ayurvedic Assessment
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-1">Ashtavidha Pariksha — AI-Assisted Assessment</h2>
            <p className="text-slate-500">Preliminary observations for clinician review</p>
          </div>

          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-2 flex items-center justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-white rounded-2xl p-4 text-center border-2 border-purple-200 shadow-lg">
                    <div className="text-xs text-purple-600 font-bold uppercase tracking-wide">Ashtavidha</div>
                    <div className="text-sm font-bold text-navy-900">8 Examinations</div>
                    <div className="text-xs text-slate-400 mt-1">3 by kiosk</div>
                  </div>
                </div>
                {items.map((item, i) => {
                  const angle = (item.angle * Math.PI) / 180;
                  const r = 110;
                  const x = 136 + r * Math.cos(angle);
                  const y = 136 + r * Math.sin(angle);
                  return (
                    <div
                      key={item.name}
                      className="absolute"
                      style={{ left: x - 28, top: y - 28 }}
                    >
                      <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 text-center transition-all ${
                        item.kiosk
                          ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                          : "bg-white border-slate-300 text-slate-500"
                      }`}>
                        <div className="text-xs font-bold leading-tight">{item.name}</div>
                        <div className="text-xs opacity-70">{item.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-3 flex flex-col gap-4">
              <div>
                <div className="font-semibold text-navy-900 mb-3">Captured by Kiosk</div>
                <div className="grid grid-cols-3 gap-3">
                  {kioskItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className="bg-white rounded-2xl border-2 border-purple-200 hover:border-purple-400 p-5 text-center transition-all hover:shadow-md group"
                    >
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-bold text-navy-900 text-sm">{item.name}</div>
                      <div className="text-xs text-purple-600">{item.label}</div>
                      <div className="mt-2 text-xs text-slate-400 group-hover:text-navy-600 transition-all">
                        Tap to capture →
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-500 mb-3 text-sm">Requires Clinician Examination</div>
                <div className="grid grid-cols-5 gap-2">
                  {["Nadi", "Mutra", "Mala", "Sparsha", "Akruti"].map((item) => (
                    <div key={item} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-xs font-semibold text-slate-500">{item}</div>
                      <div className="text-xs text-slate-400 mt-1">Clinician</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                <strong>Transparency note:</strong> The kiosk can only assist with Jihva (tongue), Drik (eye), and Shabda (voice) observations. The remaining five examinations require direct clinician assessment.
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/tongue-capture")}
              className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              Begin Tongue Assessment →
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
