import { useCallback, useRef, useState } from "react";
import { asrTranslate } from "../services/bhashiniService";
import type { SupportedLang } from "../services/bhashiniService";

interface Options {
  lang: SupportedLang;
  onFinalTranscript?: (text: string) => void;
}

export interface BhasiniASRTurn {
  id: string;
  speaker: "patient";
  text: string;
  final: boolean;
  sourceText?: string;
  error?: string;
}

export function useBhashiniASR({ lang, onFinalTranscript }: Options) {
  const [isListening, setIsListening] = useState(false);
  const [turns, setTurns] = useState<BhasiniASRTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Microphone access denied";
      setError(msg);
      return;
    }
    streamRef.current = stream;

    const mimeType =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
      : "";

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
      let base64: string;
      try {
        base64 = await blobToBase64(blob);
      } catch {
        setError("Failed to encode audio.");
        return;
      }

      const turnId = `p-${Date.now()}`;
      setTurns((t) => [...t, { id: turnId, speaker: "patient", text: "…", final: false }]);

      const result = await asrTranslate(base64, lang);

      if (result.success && result.englishText) {
        setTurns((t) =>
          t.map((tr) =>
            tr.id === turnId
              ? { ...tr, text: result.englishText!, final: true, sourceText: result.sourceText }
              : tr
          )
        );
        onFinalTranscript?.(result.englishText!);
      } else {
        setTurns((t) =>
          t.map((tr) =>
            tr.id === turnId
              ? { ...tr, text: result.error || "Translation failed", final: true, error: result.error }
              : tr
          )
        );
        setError(result.error || "ASR translation failed");
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsListening(true);

    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
    }, 10000);
  }, [lang, onFinalTranscript]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsListening(false);
  }, []);

  return { isListening, turns, error, startListening, stopListening };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
