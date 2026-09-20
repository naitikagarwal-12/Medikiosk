import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import CameraFeed, { CameraFeedHandle } from "../../components/CameraFeed";

export default function TongueCapture() {
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [frame, setFrame] = useState<string | null>(null);
  const cameraRef = useRef<CameraFeedHandle>(null);

  const handleCapture = () => {
    const snapshot = cameraRef.current?.capture() ?? null;
    setFrame(snapshot);
    setCaptured(true);
    setTimeout(() => { setAnalyzing(true); setTimeout(() => navigate("/eye-capture"), 1500); }, 800);
  };

  const handleRetake = () => {
    setCaptured(false);
    setAnalyzing(false);
    setFrame(null);
  };

  return (
    <KioskLayout progress={74} step="Step 7a — Tongue Assessment" showBack backTo="/ashtavidha">
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">👅</div>
            <h2 className="text-3xl font-bold text-navy-900 mb-2">Tongue Assessment</h2>
            <p className="text-slate-500">Jihva Pariksha — for clinician review only</p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 mb-6">
            <div className="aspect-video max-w-lg mx-auto rounded-2xl overflow-hidden relative bg-slate-800">
              {!captured && !cameraError && (
                <CameraFeed
                  ref={cameraRef}
                  facingMode="user"
                  className="absolute inset-0"
                  onError={(msg) => setCameraError(msg)}
                />
              )}
              {(!captured && cameraError) && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <div className="text-6xl mb-3">👅</div>
                    <p className="text-sm">Camera preview</p>
                  </div>
                </div>
              )}
              {captured && (
                <div className="absolute inset-0 bg-slate-800">
                  {frame && <img src={frame} alt="Captured tongue" className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-slate-900/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-5xl mb-2">{analyzing ? "🔍" : "✓"}</div>
                      <p className="text-sm">{analyzing ? "Analyzing…" : "Image captured"}</p>
                    </div>
                  </div>
                </div>
              )}
              {!captured && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-dashed border-yellow-400/60 rounded-full w-40 h-28"></div>
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/50 text-slate-300 text-xs px-3 py-1 rounded-full">
                  {captured ? "Image captured ✓" : cameraError ? "Front camera unavailable — using simulated preview." : "Stick out your tongue naturally and keep your face still"}
                </span>
              </div>
            </div>
          </div>

          {captured && !analyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
              <div className="font-semibold text-slate-700 mb-3">Image Quality</div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: "82%" }} />
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-600">Quality Score</span>
                <span className="font-bold text-teal-600">82%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["Lighting ✓", "Focus ✓", "Tongue visible ✓"].map((c) => (
                  <div key={c} className="text-xs text-teal-700 bg-teal-50 px-3 py-2 rounded-lg text-center font-medium">{c}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {!captured ? (
              <button
                onClick={handleCapture}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xl font-semibold px-14 py-5 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                📷 Capture
              </button>
            ) : (
              <>
                <button
                  onClick={handleRetake}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-medium px-8 py-4 rounded-2xl transition-all"
                >
                  Retake
                </button>
                <button
                  onClick={() => navigate("/eye-capture")}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  Analyze Tongue →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
