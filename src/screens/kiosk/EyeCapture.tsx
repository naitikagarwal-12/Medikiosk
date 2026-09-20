import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import CameraFeed, { CameraFeedHandle } from "../../components/CameraFeed";

export default function EyeCapture() {
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [frame, setFrame] = useState<string | null>(null);
  const cameraRef = useRef<CameraFeedHandle>(null);

  const handleCapture = () => {
    const snapshot = cameraRef.current?.capture() ?? null;
    setFrame(snapshot);
    setCaptured(true);
  };

  const handleRetake = () => {
    setCaptured(false);
    setFrame(null);
  };

  return (
    <KioskLayout progress={78} step="Step 7b — Eye Assessment" showBack backTo="/tongue-capture">
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">👁</div>
            <h2 className="text-3xl font-bold text-navy-900 mb-2">Eye Assessment</h2>
            <p className="text-slate-500">Drik Pariksha — for clinician review only</p>
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
              {!captured && cameraError && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <div className="text-6xl mb-3">👁</div>
                    <p className="text-sm">Look directly at the camera</p>
                  </div>
                </div>
              )}
              {captured && (
                <div className="absolute inset-0 bg-slate-900">
                  {frame && <img src={frame} alt="Captured eyes" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-5xl mb-2">✓</div>
                      <p className="text-sm text-teal-300">Eye image captured</p>
                    </div>
                  </div>
                </div>
              )}

              {!captured && (
                <div className="absolute inset-0 flex items-center justify-center gap-16 pointer-events-none">
                  <div className="border-2 border-dashed border-teal-400/60 rounded-full w-28 h-20"></div>
                  <div className="border-2 border-dashed border-teal-400/60 rounded-full w-28 h-20"></div>
                </div>
              )}
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-20">
                <span className="bg-black/40 text-xs text-teal-300 px-2 py-0.5 rounded">Left eye</span>
                <span className="bg-black/40 text-xs text-teal-300 px-2 py-0.5 rounded">Right eye</span>
              </div>
            </div>
          </div>

          {captured && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 grid grid-cols-3 gap-3">
              {["Lighting ✓", "Focus ✓", "Visibility ✓"].map((c) => (
                <div key={c} className="text-xs text-teal-700 bg-teal-50 px-3 py-2 rounded-lg text-center font-medium">{c}</div>
              ))}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {!captured ? (
              <button
                onClick={handleCapture}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xl font-semibold px-14 py-5 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                📷 Capture Eye Image
              </button>
            ) : (
              <>
                <button onClick={handleRetake} className="bg-slate-100 text-slate-700 text-lg font-medium px-8 py-4 rounded-2xl">
                  Retake
                </button>
                <button
                  onClick={() => navigate("/voice-capture")}
                  className="bg-navy-900 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg"
                >
                  Continue →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
