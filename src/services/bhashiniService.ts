const BASE_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BHASHINI_URL ||
  "http://localhost:5001";

export type SupportedLang =
  | "en"
  | "hi"
  | "bn"
  | "mr"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "gu"
  | "pa"
  | "or"
  | "as"
  | "ur";

export interface BhasiniTranslateResult {
  success: boolean;
  translatedText?: string;
  error?: string;
}

export interface BhasiniASRResult {
  success: boolean;
  sourceText?: string;
  englishText?: string;
  error?: string;
}

export interface BhasiniTTSResult {
  success: boolean;
  translatedText?: string;
  audioBase64?: string;
  mimeType?: string;
  error?: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  }
  return data as T;
}


export async function translate(
  text: string,
  sourceLang: SupportedLang | "auto" = "auto",
  targetLang: SupportedLang = "en"
): Promise<BhasiniTranslateResult> {
  if (!text.trim()) return { success: true, translatedText: "" };
  try {
    const result = await post<BhasiniTranslateResult>("/bhashini/translate", {
      text,
      sourceLang,
      targetLang,
    });
    return result;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}


export async function asrTranslate(
  audioBase64: string,
  sourceLang: SupportedLang = "hi"
): Promise<BhasiniASRResult> {
  if (!audioBase64.trim()) return { success: false, error: "No audio data" };
  try {
    const result = await post<BhasiniASRResult>("/bhashini/asr-translate", {
      audioBase64,
      sourceLang,
      targetLang: "en",
    });
    return result;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}


export async function translateAndSpeak(
  text: string,
  targetLang: SupportedLang = "hi"
): Promise<BhasiniTTSResult> {
  if (!text.trim()) return { success: true, translatedText: "", audioBase64: "" };
  try {
    const result = await post<BhasiniTTSResult>("/bhashini/translate-and-speak", {
      text,
      targetLang,
    });
    return result;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}


export function playBase64Audio(base64: string, mimeType = "audio/wav"): void {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob   = new Blob([bytes], { type: mimeType });
  const url     = URL.createObjectURL(blob);
  const audio   = new Audio(url);
  audio.play().catch(console.error);
  audio.addEventListener("ended", () => URL.revokeObjectURL(url));
}

export async function bhasiniReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/bhashini/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; bhasiniReachable?: boolean };
    return !!(data.success && data.bhasiniReachable);
  } catch {
    return false;
  }
}
