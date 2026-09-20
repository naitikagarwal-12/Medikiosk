import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";
import CameraFeed from "../../components/CameraFeed";

const ocrSteps = [
  { label: "Image captured", done: false },
  { label: "Text extraction", done: false },
  { label: "Document classification", done: false },
  { label: "Added to patient record", done: false },
];

const docTypes = ["Prescription", "Lab Report", "Discharge Summary", "Other"];

export default function ScanDocuments() {
  const navigate = useNavigate();
  const { uploadedDocuments, addUploadedDocument } = useKiosk();
  const [capturing, setCapturing] = useState(false);
  const [docType, setDocType] = useState(docTypes[0]);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [stepsDone, setStepsDone] = useState([false, false, false, false]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleCapture = () => {
    setCapturing(true);
    setStepsDone([false, false, false, false]);
    setOcrProgress(0);
    let step = 0;
    const advance = () => {
      if (step >= 4) {
        addUploadedDocument({
          id: `doc-${Date.now()}`,
          name: `${docType} — ${new Date().toLocaleTimeString()}`,
          category: docType,
          capturedAt: new Date().toISOString(),
        });
        setTimeout(() => setCapturing(false), 500);
        return;
      }
      setStepsDone((s) => s.map((v, i) => (i <= step ? true : v)));
      setOcrProgress(Math.round(((step + 1) / 4) * 100));
      step++;
      setTimeout(advance, 600);
    };
    setTimeout(advance, 400);
  };

  return (
    <KioskLayout progress={58} step="Step 7 of 12 — Scan Additional Documents" showBack backTo="/record-select">
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">Add Any Other Documents</h2>
            <p className="text-slate-500 text-lg">
              Scan prescriptions, lab reports or any other paper record you'd like your physician to see today. This step is optional.
            </p>
          </div>

          {!capturing ? (
            <>
              <div className="flex justify-center gap-2 mb-6">
                {docTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setDocType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      docType === t ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 mb-6">
                <div className="aspect-video max-w-xl mx-auto rounded-2xl overflow-hidden relative bg-slate-800">
                  {cameraError ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>
                  ) : (
                    <CameraFeed
                      facingMode="environment"
                      className="absolute inset-0"
                      onError={(msg) => setCameraError(msg)}
                    />
                  )}
                  <div className="absolute inset-10 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center pointer-events-none">
                    {cameraError && (
                      <div className="text-center text-slate-400">
                        <div className="text-5xl mb-2">📄</div>
                        <p className="text-sm">Place {docType.toLowerCase()} here</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                      {cameraError ? "Rear camera unavailable — using simulated preview." : "Position document within the highlighted frame"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center mb-8">
                <button
                  onClick={handleCapture}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xl font-semibold px-12 py-5 rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  📷 Capture Document
                </button>
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Documents added ({uploadedDocuments.length})
                  </div>
                  <div className="space-y-2">
                    {uploadedDocuments.map((d) => (
                      <div key={d.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <span>📄</span>
                          {d.name}
                        </div>
                        <span className="text-xs text-teal-600 font-medium">✓ Added</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 text-base font-medium px-8 py-4 rounded-2xl transition-all"
                >
                  {uploadedDocuments.length > 0 ? "Done — Continue →" : "Skip This Step →"}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                  Edge OCR
                </div>
                <span className="text-slate-600 font-medium">Processing {docType.toLowerCase()}…</span>
                <span className="progress-pulse text-orange-500">●</span>
              </div>
              <div className="space-y-4">
                {ocrSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                      stepsDone[i] ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {stepsDone[i] ? "✓" : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${stepsDone[i] ? "text-slate-800" : "text-slate-400"}`}>{step.label}</div>
                      {i === 0 && stepsDone[i] && <div className="text-xs text-teal-600 mt-0.5">Image quality: 84% — Lighting ✓ Focus ✓</div>}
                    </div>
                    {i < 3 && stepsDone[i] && !stepsDone[i + 1] && (
                      <div className="text-orange-400 text-sm progress-pulse">processing…</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
