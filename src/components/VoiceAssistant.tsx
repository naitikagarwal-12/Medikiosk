import { useEffect, useRef, useState } from "react";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import { useBhashiniASR } from "../hooks/useBhashiniASR";
import { useBhashiniTTS } from "../hooks/useBhashiniTTS";
import { useKiosk } from "../context/KioskContext";
import type { SupportedLang } from "../services/bhashiniService";

interface Props {
  prompt?: string;
  onFinalTranscript?: (text: string) => void;
}

export default function VoiceAssistant({ prompt, onFinalTranscript }: Props) {
  const { language } = useKiosk();
  const isIndic = language !== "en";

  const bcp47 = isIndic ? `${language}-IN` : "en-IN";

  const browserVA = useVoiceAssistant({ lang: bcp47 });

  const bhashiniASR = useBhashiniASR({
    lang: language as SupportedLang,
    onFinalTranscript: (text) => {
      bhashiniTTS.speak("Got it.");
      onFinalTranscript?.(text.toLowerCase());
    },
  });

  const bhashiniTTS = useBhashiniTTS({
    lang: language as SupportedLang,
    enabled: isIndic,
  });

  const isSpeaking = isIndic ? bhashiniTTS.isSpeaking : browserVA.isSpeaking;
  const isListening = isIndic ? bhashiniASR.isListening : browserVA.isListening;
  const supported = isIndic ? true : browserVA.supported;
  const speechSupported = isIndic ? true : browserVA.speechSupported;

  const lastBrowserTurn = browserVA.turns[browserVA.turns.length - 1];
  const lastBhashiniTurn = bhashiniASR.turns[bhashiniASR.turns.length - 1];
  const lastTurn = isIndic ? lastBhashiniTurn : lastBrowserTurn;
  const turnsLength = isIndic ? bhashiniASR.turns.length : browserVA.turns.length;

  const [showCaptions, setShowCaptions] = useState(false);
  const captionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (turnsLength === 0) return;
    setShowCaptions(true);
    if (captionTimeout.current) clearTimeout(captionTimeout.current);
    captionTimeout.current = setTimeout(() => setShowCaptions(false), 9000);
    return () => {
      if (captionTimeout.current) clearTimeout(captionTimeout.current);
    };
  }, [turnsLength]);

  const handleSpeakerClick = () => {
    if (!prompt) return;
    if (isIndic) {
      bhashiniTTS.speak(prompt);
    } else {
      browserVA.speak(prompt);
    }
  };

  const handleMicClick = () => {
    if (isIndic) {
      if (bhashiniASR.isListening) {
        bhashiniASR.stopListening();
      } else {
        bhashiniASR.startListening();
      }
    } else {
      if (browserVA.isListening) {
        browserVA.stopListening();
        return;
      }
      browserVA.startListening((finalText) => {
        const lower = finalText.toLowerCase();
        browserVA.speak("Got it.");
        onFinalTranscript?.(lower);
      });
    }
  };

  return (
    <>
      {showCaptions && lastTurn && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
          <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-xl px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
              {lastTurn.speaker === "assistant" ? "Assistant said" : "You said"}
            </div>
            <div className={`text-sm text-navy-900 ${!lastTurn.final ? "italic opacity-70" : ""}`}>
              {lastTurn.text || "…"}
            </div>
          </div>
        </div>
      )}

      {!supported && (
        <div className="fixed bottom-40 right-6 z-40 max-w-[220px] text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 shadow">
          Voice replies aren't supported in this browser. Try the latest Chrome.
        </div>
      )}

      <button
        onClick={handleSpeakerClick}
        disabled={!speechSupported || !prompt}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-navy-900 hover:bg-navy-800 disabled:opacity-40 text-white shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
        title="Hear instructions"
        aria-label="Play spoken instructions"
      >
        <span className="text-2xl leading-none">{isSpeaking ? "🔊" : "🔈"}</span>
      </button>

      <button
        onClick={handleMicClick}
        disabled={!supported}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all disabled:opacity-40 border-4 border-white ${
          isListening ? "bg-red-500 animate-pulse scale-105" : "bg-teal-600 hover:bg-teal-500 active:scale-95"
        }`}
        title={isListening ? "Listening… tap to stop" : "Tap to speak"}
        aria-label={isListening ? "Stop listening" : "Speak to the assistant"}
      >
        <span className="text-4xl leading-none">🎙</span>
        <span className="text-[11px] font-bold mt-0.5">{isListening ? "Listening…" : "Tap to Speak"}</span>
      </button>
    </>
  );
}
