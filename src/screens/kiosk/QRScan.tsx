import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import CameraFeed from "../../components/CameraFeed";

export default function QRScan() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const simulateScan = () => {
    setScanning(false);
    setTimeout(() => navigate("/record-fetch"), 800);
  };

  const goToRecordFetch = () => navigate("/record-fetch");

  const simulateError = () => {
    setScanning(false);
    setError(true);
  };

  return (
    <KioskLayout progress={33} step="Step 4 of 12 — ABHA Authentication" showBack backTo="/auth">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">Scan Your ABHA QR Code</h2>
            <p className="text-lg text-slate-500">अपना ABHA QR कोड स्कैन करें</p>
          </div>

          {error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-700 mb-2">We couldn't read the QR code.</h3>
              <p className="text-slate-600 mb-6">Please ensure the QR code is clear and well-lit.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => { setError(false); setScanning(true); }}
                  className="bg-navy-900 text-white px-8 py-3 rounded-xl font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold"
                >
                  Try Aadhaar Instead
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-900 rounded-3xl p-6 mb-6 relative overflow-hidden">
                <div className="aspect-square max-w-md mx-auto relative rounded-2xl overflow-hidden bg-slate-800">
                  {cameraError ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>
                  ) : (
                    <CameraFeed
                      facingMode="environment"
                      className="absolute inset-0"
                      onError={(msg) => setCameraError(msg)}
                    />
                  )}

                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-teal-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-teal-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-teal-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-teal-400 rounded-br-lg"></div>
                    {scanning && (
                      <div className="scan-line absolute left-2 right-2 h-0.5 bg-teal-400 opacity-80 shadow-[0_0_8px_rgba(20,184,166,0.8)]" style={{ top: "50%" }}></div>
                    )}
                    {!scanning && !error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-teal-400 text-6xl">✓</div>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    {scanning ? (
                      <span className="bg-black/50 text-teal-300 text-sm px-4 py-1.5 rounded-full">
                        <span className="progress-pulse inline-block">Scanning…</span>
                      </span>
                    ) : (
                      <span className="bg-teal-500/80 text-white text-sm px-4 py-1.5 rounded-full">
                        QR Code Detected ✓
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 text-center mt-4 text-sm">
                  {cameraError ? "Rear camera unavailable — using simulated preview." : "Hold your ABHA QR code inside the frame"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                🔒 Secure connection — NHA authenticated
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={simulateScan}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  Simulate Scan ✓
                </button>
                <button
                  onClick={goToRecordFetch}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-base font-medium px-6 py-4 rounded-2xl transition-all"
                >
                  Enter ABHA ID manually
                </button>
                <button
                  onClick={simulateError}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm px-4 py-4 rounded-2xl transition-all"
                >
                  Test Error State
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
