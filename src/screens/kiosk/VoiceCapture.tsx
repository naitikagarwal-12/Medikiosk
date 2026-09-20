import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function VoiceCapture() {
  const navigate = useNavigate();
  const { language } = useKiosk();
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const { t: heading } = useTranslation("Voice Assessment");
  const { t: subheading } = useTranslation("Shabda Pariksha — for clinician review only");
  const { t: instruction } = useTranslation("Please say the following sentence naturally:");
  const { t: sampleSentence } = useTranslation(
    "I have come to the hospital because I have not been feeling well."
  );
  const { t: startBtn } = useTranslation("Start Recording");
  const { t: stopBtn } = useTranslation("Stop Recording");
  const { t: redoBtn } = useTranslation("Record Again");
  const { t: continueBtn } = useTranslation("Continue to AI Analysis");
  const { t: recordingComplete } = useTranslation("Recording complete");

  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s >= 10) { setRecording(false); setDone(true); clearInterval(interval); return 10; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recording]);

  const bars = Array.from({ length: 24 }, (_, i) => ({
    height: recording ? Math.random() * 60 + 20 : 8,
    delay: i * 0.05,
  }));

  return (
    <KioskLayout progress={82} step="Step 7c — Voice Assessment" showBack backTo="/eye-capture">
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🎙</div>
            <h2 className="text-3xl font-bold text-navy-900 mb-2">{heading}</h2>
            <p className="text-slate-500">{subheading}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">
            <div className="text-center mb-6">
              <p className="text-slate-600 font-medium mb-2">{instruction}</p>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <p className="text-xl font-medium text-navy-900 italic leading-relaxed">
                  "{sampleSentence}"
                </p>
                {language === "en" && (
                  <p className="text-slate-400 text-sm mt-2">
                    "मैं अस्पताल आया हूँ क्योंकि मुझे अच्छा नहीं लग रहा था।"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 h-16 mb-4">
              {bars.map((bar, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-150 ${recording ? "bg-navy-600" : done ? "bg-teal-500" : "bg-slate-200"}`}
                  style={{
                    width: 4,
                    height: recording ? `${Math.sin(i * 0.5 + Date.now() * 0.001) * 24 + 32}px` : done ? "32px" : "8px",
                    animationDelay: `${bar.delay}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <span className={`text-2xl font-mono font-bold ${recording ? "text-navy-900" : "text-slate-400"}`}>
                00:{String(seconds).padStart(2, "0")} / 00:10
              </span>
              {recording && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
              {done && <span className="text-teal-600 font-semibold">{recordingComplete} ✓</span>}
            </div>

            <div className="flex gap-4 justify-center">
              {!recording && !done && (
                <button
                  onClick={() => { setRecording(true); setSeconds(0); setDone(false); }}
                  className="bg-red-500 hover:bg-red-600 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                  <span className="w-3 h-3 bg-white rounded-full"></span> {startBtn}
                </button>
              )}
              {recording && (
                <button
                  onClick={() => { setRecording(false); setDone(true); }}
                  className="bg-slate-700 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all"
                >
                  ⏹ {stopBtn}
                </button>
              )}
              {done && (
                <>
                  <button
                    onClick={() => { setDone(false); setSeconds(0); }}
                    className="bg-slate-100 text-slate-700 text-base font-medium px-8 py-4 rounded-2xl"
                  >
                    {redoBtn}
                  </button>
                  <button
                    onClick={() => navigate("/ai-processing")}
                    className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg"
                  >
                    {continueBtn} →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
