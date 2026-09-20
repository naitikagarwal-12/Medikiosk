import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceTurn {
  id: string;
  speaker: "assistant" | "patient";
  text: string;
  final: boolean;
}

interface UseVoiceAssistantOptions {
  lang?: string;
}

export function useVoiceAssistant({ lang = "en-IN" }: UseVoiceAssistantOptions = {}) {
  const [supported, setSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const RecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!RecognitionCtor);
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!text) return;
      setTurns((t) => [...t, { id: `a-${Date.now()}`, speaker: "assistant", text, final: true }]);

      if (!speechSupported && !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [lang, speechSupported]
  );

  const startListening = useCallback(
    (onFinalText?: (text: string) => void) => {
      const RecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!RecognitionCtor) {
        setSupported(false);
        return;
      }

      window.speechSynthesis?.cancel();
      setIsSpeaking(false);

      const recognition = new RecognitionCtor();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      const turnId = `p-${Date.now()}`;
      setTurns((t) => [...t, { id: turnId, speaker: "patient", text: "", final: false }]);

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript as string;
          if (event.results[i].isFinal) final += transcript;
          else interim += transcript;
        }
        const text = (final || interim).trim();
        setTurns((t) => t.map((turn) => (turn.id === turnId ? { ...turn, text, final: !!final } : turn)));
        if (final) onFinalText?.(final.trim());
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    },
    [lang]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => setTurns([]), []);

  return {
    supported,
    speechSupported,
    isSpeaking,
    isListening,
    turns,
    speak,
    startListening,
    stopListening,
    reset,
  };
}
