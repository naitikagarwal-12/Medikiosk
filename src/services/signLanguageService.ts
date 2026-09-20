const API_KEY =
  typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string | undefined> }).env
    ? (import.meta as { env: Record<string, string | undefined> }).env.VITE_GROQ_API_KEY ?? ""
    : "";
const MODEL = "llama-3.1-8b-instant";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export type SignToken = string;

export interface SignLanguageResult {
  tokens: SignToken[];
  fromCloud: boolean;
  source: string;
}

const KNOWN_PHRASES = [
  "hello",
  "thank you",
  "thanks",
  "please",
  "sorry",
  "yes",
  "no",
  "help",
  "doctor",
  "medicine",
  "water",
  "pain",
  "good",
  "bad",
  "ok",
  "okay",
  "stop",
  "wait",
  "name",
  "i",
  "you",
  "we",
  "they",
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function tokenizeLocal(text: string): SignToken[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

async function tokenizeWithGroq(text: string): Promise<SignToken[] | null> {
  try {
    const systemPrompt = `You split English sentences into short, natural sign-units for an Indian Sign Language avatar.

Rules:
- Output ONLY a JSON array of lowercase strings, no prose, no markdown.
- Each string is a sign-unit: either a known phrase ("thank you", "i am", "doctor", "pain") OR a single letter ("a".."z") for finger-spelling, OR a digit as a string ("1", "2").
- Keep it short — prefer 1–2 word units. Break long words into letters.
- Example: "Hello doctor, I have a headache" -> ["hello","doctor","i","h","a","v","e","a","h","e","a","d","a","c","h","e"]`;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Sentence: "${text}"\nReturn JSON like {"tokens": ["..."]}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    const tokens = Array.isArray(parsed.tokens) ? parsed.tokens : Array.isArray(parsed) ? parsed : null;
    if (!tokens) return null;
    return tokens
      .map((t: unknown) => (typeof t === "string" ? t.trim().toLowerCase() : ""))
      .filter((t: string) => t.length > 0 && t.length <= 24);
  } catch {
    return null;
  }
}

export async function planSigns(text: string): Promise<SignLanguageResult> {
  const trimmed = text.trim();
  if (!trimmed) return { tokens: [], fromCloud: false, source: "empty" };

  const cloud = await tokenizeWithGroq(trimmed);
  if (cloud && cloud.length > 0) {
    return { tokens: cloud, fromCloud: true, source: "groq" };
  }
  return { tokens: tokenizeLocal(trimmed), fromCloud: false, source: "offline fallback" };
}

export function isKnownPhrase(token: string): boolean {
  return KNOWN_PHRASES.includes(token);
}

export function isLetter(token: string): boolean {
  return token.length === 1 && ALPHABET.includes(token);
}

export const KNOWN_PHRASE_LIST = KNOWN_PHRASES;
export const ALPHABET_LIST = ALPHABET;
