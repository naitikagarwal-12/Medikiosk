import { useCallback, useEffect, useRef, useState } from "react";
import { bhasiniReachable, playBase64Audio, translateAndSpeak } from "../services/bhashiniService";
import type { SupportedLang } from "../services/bhashiniService";

interface Options {
  lang: SupportedLang;
  enabled?: boolean;
}

export function useBhashiniTTS({ lang, enabled = true }: Options) {
  const [isOnline, setIsOnline] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) { setIsOnline(false); return; }
    void bhasiniReachable().then(setIsOnline).catch(() => setIsOnline(false));
  }, [enabled, lang]);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;
      window.speechSynthesis?.cancel();
      if (abortRef.current) { abortRef.current.abort(); }
      abortRef.current = new AbortController();

      if (enabled && isOnline && lang !== "en") {
        setIsSpeaking(true);
        try {
          const result = await translateAndSpeak(text, lang);
          if (result.success && result.audioBase64) {
            playBase64Audio(result.audioBase64, result.mimeType || "audio/wav");
            const estDurationMs = Math.max(1000, (result.translatedText?.length ?? text.length) * 80);
            setTimeout(() => setIsSpeaking(false), estDurationMs);
            return;
          }
        } catch {
        } finally {
          setIsSpeaking(false);
        }
      }

      if (!window.speechSynthesis) return;
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang  = lang === "en" ? "en-IN" : `${lang}-IN`;
      utterance.rate  = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [enabled, isOnline, lang]
  );

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    abortRef.current?.abort();
    setIsSpeaking(false);
  }, []);

  return { isOnline, isSpeaking, speak, cancel };
}
