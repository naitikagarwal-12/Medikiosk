import { useEffect, useMemo, useRef, useState } from "react";
import {
  planSigns,
  isKnownPhrase,
  isLetter,
  KNOWN_PHRASE_LIST,
  type SignToken,
} from "../services/signLanguageService";
import { translate } from "../services/bhashiniService";
import type { SupportedLang } from "../services/bhashiniService";

interface Props {
  text?: string;
  autoSign?: boolean;
  sourceLang?: SupportedLang;
}


const POSE_PER_MS = 900;

const PRESET_PHRASES = [
  "Hello doctor, I have pain.",
  "Thank you for your help.",
  "Please give me medicine.",
  "I need water.",
  "I am sorry, I do not understand.",
];

function AvatarFigure({ token }: { token: string | null }) {
  const pose = useMemo(() => poseFor(token), [token]);

  return (
    <svg viewBox="0 0 200 240" className="w-44 h-52 select-none">
      <defs>
        <radialGradient id="floor" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#E0F2F1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="225" rx="80" ry="10" fill="url(#floor)" />

      <circle cx="100" cy="50" r="32" fill="#FBCFA0" stroke="#B98554" strokeWidth="2" />
      <circle cx="88" cy="48" r="3" fill="#3A3A3A" />
      <circle cx="112" cy="48" r="3" fill="#3A3A3A" />
      <path
        d={
          pose.mouth === "smile"
            ? "M86 64 Q100 74 114 64"
            : pose.mouth === "open"
            ? "M90 64 Q100 72 110 64"
            : "M88 64 Q100 68 112 64"
        }
        stroke="#3A3A3A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M68 38 Q100 6 132 38 Q132 22 100 18 Q68 22 68 38 Z" fill="#3A2E2A" />
      <circle cx="78" cy="58" r="3" fill="#F8B4B4" opacity="0.6" />
      <circle cx="122" cy="58" r="3" fill="#F8B4B4" opacity="0.6" />

      <rect x="64" y="80" width="72" height="86" rx="20" fill="#0F5C63" />
      <path d="M88 80 L100 96 L112 80" fill="#0B4A50" />

      <g
        style={{
          transformOrigin: "136px 94px",
          transform: `rotate(${pose.rightArm}deg)`,
          transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <rect x="130" y="90" width="16" height="62" rx="8" fill="#0F5C63" />
        <Hand cx={138} cy={156} shape={pose.rightHand} />
      </g>

      <g
        style={{
          transformOrigin: "64px 94px",
          transform: `rotate(${pose.leftArm}deg)`,
          transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <rect x="54" y="90" width="16" height="62" rx="8" fill="#0F5C63" />
        <Hand cx={62} cy={156} shape={pose.leftHand} />
      </g>

      <rect x="74" y="164" width="18" height="56" rx="6" fill="#1F2937" />
      <rect x="108" y="164" width="18" height="56" rx="6" fill="#1F2937" />
      <rect x="72" y="216" width="22" height="8" rx="3" fill="#0B4A50" />
      <rect x="106" y="216" width="22" height="8" rx="3" fill="#0B4A50" />

      {token && (
        <g>
          <rect
            x="148"
            y="38"
            width="46"
            height="24"
            rx="6"
            fill="#0F5C63"
            opacity="0.95"
          />
          <text
            x="171"
            y="54"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#fff"
            fontFamily="system-ui, sans-serif"
          >
            {token.length > 6 ? token.slice(0, 6) + "…" : token}
          </text>
        </g>
      )}
    </svg>
  );
}

function Hand({ cx, cy, shape }: { cx: number; cy: number; shape: HandShape }) {
  const fill = "#FBCFA0";
  const stroke = "#B98554";
  return (
    <g>
      <circle cx={cx} cy={cy} r="10" fill={fill} stroke={stroke} strokeWidth="2" />
      {shape === "fist" && (
        <path d={`M${cx - 8} ${cy - 2} l-4 -4`} stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      {shape === "point" && (
        <g>
          <rect x={cx - 2} y={cy - 16} width="4" height="10" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d={`M${cx - 8} ${cy - 2} l-4 -4`} stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}
      {shape === "thumbs" && (
        <g>
          <rect x={cx - 2} y={cy - 18} width="4" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d={`M${cx - 8} ${cy - 2} l-4 -4`} stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}
      {shape === "open" && (
        <g>
          <rect x={cx - 5} y={cy - 16} width="2" height="10" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
          <rect x={cx - 1.5} y={cy - 18} width="2" height="12" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
          <rect x={cx + 2} y={cy - 16} width="2" height="10" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
          <path d={`M${cx - 8} ${cy - 2} l-4 -4`} stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}
      {shape === "flat" && (
        <rect x={cx - 6} y={cy - 16} width="12" height="10" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      )}
    </g>
  );
}

type HandShape = "open" | "fist" | "point" | "thumbs" | "flat";
interface PoseSpec {
  leftArm: number;
  rightArm: number;
  leftHand: HandShape;
  rightHand: HandShape;
  mouth: "smile" | "open" | "neutral";
}

function poseFor(token: string | null): PoseSpec {
  if (!token) return { leftArm: -8, rightArm: 8, leftHand: "open", rightHand: "open", mouth: "neutral" };

  if (isLetter(token)) {
    const t = token;
    const hand: HandShape = "point";
    return { leftArm: -5, rightArm: -75, leftHand: "open", rightHand: hand, mouth: "neutral" };
  }

  switch (token) {
    case "hello":
    case "hi":
      return { leftArm: 10, rightArm: -55, leftHand: "open", rightHand: "open", mouth: "smile" };
    case "thank you":
    case "thanks":
      return { leftArm: -30, rightArm: 30, leftHand: "flat", rightHand: "flat", mouth: "smile" };
    case "please":
      return { leftArm: -55, rightArm: 10, leftHand: "flat", rightHand: "open", mouth: "neutral" };
    case "sorry":
      return { leftArm: -50, rightArm: 10, leftHand: "fist", rightHand: "open", mouth: "neutral" };
    case "yes":
      return { leftArm: -10, rightArm: -25, leftHand: "fist", rightHand: "fist", mouth: "neutral" };
    case "no":
      return { leftArm: -5, rightArm: -50, leftHand: "open", rightHand: "point", mouth: "neutral" };
    case "help":
      return { leftArm: -20, rightArm: 20, leftHand: "thumbs", rightHand: "thumbs", mouth: "open" };
    case "doctor":
      return { leftArm: -45, rightArm: -10, leftHand: "flat", rightHand: "point", mouth: "neutral" };
    case "medicine":
    case "pill":
      return { leftArm: -10, rightArm: -70, leftHand: "open", rightHand: "fist", mouth: "open" };
    case "water":
      return { leftArm: -10, rightArm: -65, leftHand: "open", rightHand: "point", mouth: "open" };
    case "pain":
    case "hurt":
      return { leftArm: -30, rightArm: 30, leftHand: "point", rightHand: "point", mouth: "neutral" };
    case "good":
      return { leftArm: -55, rightArm: 10, leftHand: "flat", rightHand: "open", mouth: "smile" };
    case "bad":
      return { leftArm: 30, rightArm: 10, leftHand: "flat", rightHand: "open", mouth: "neutral" };
    case "ok":
    case "okay":
      return { leftArm: -10, rightArm: -25, leftHand: "open", rightHand: "thumbs", mouth: "smile" };
    case "stop":
      return { leftArm: -60, rightArm: 10, leftHand: "flat", rightHand: "open", mouth: "neutral" };
    case "wait":
      return { leftArm: -50, rightArm: 10, leftHand: "open", rightHand: "open", mouth: "neutral" };
    case "name":
      return { leftArm: -25, rightArm: 25, leftHand: "open", rightHand: "open", mouth: "neutral" };
    case "i":
    case "me":
      return { leftArm: -55, rightArm: 10, leftHand: "point", rightHand: "open", mouth: "neutral" };
    case "you":
      return { leftArm: -10, rightArm: -70, leftHand: "open", rightHand: "point", mouth: "neutral" };
    case "we":
    case "us":
      return { leftArm: -30, rightArm: 30, leftHand: "point", rightHand: "point", mouth: "neutral" };
    case "they":
    case "them":
      return { leftArm: -10, rightArm: 60, leftHand: "open", rightHand: "point", mouth: "neutral" };
    default:
      return { leftArm: -25, rightArm: 25, leftHand: "open", rightHand: "open", mouth: "neutral" };
  }
}

export default function SignLanguageAvatar({ text, autoSign = false, sourceLang = "en" }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState<SignToken[]>([]);
  const [current, setCurrent] = useState(0);
  const [planning, setPlanning] = useState(false);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showStepCaption, setShowStepCaption] = useState(true);
  const [translatedCaption, setTranslatedCaption] = useState<{
    original: string;
    translated: string;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const lastAutoText = useRef<string>("");

  useEffect(() => {
    if (!autoSign || !text || !open) return;
    if (text === lastAutoText.current) return;
    lastAutoText.current = text;
    void runPlan(text);
  }, [text, autoSign, open]);

  useEffect(() => {
    if (tokens.length === 0) {
      setCurrent(0);
      return;
    }
    const t = setTimeout(() => {
      setCurrent((c) => {
        if (c + 1 >= tokens.length) return c;
        return c + 1;
      });
    }, POSE_PER_MS);
    return () => clearTimeout(t);
  }, [current, tokens]);

  async function runPlan(raw: string) {
    setError(null);
    setPlanning(true);
    setTokens([]);
    setCurrent(0);
    setSource("");
    setTranslatedCaption(null);

    let toSign = raw;
    if (sourceLang !== "en") {
      setIsTranslating(true);
      const tr = await translate(raw, sourceLang, "en");
      setIsTranslating(false);
      if (tr.success && tr.translatedText) {
        toSign = tr.translatedText;
        setTranslatedCaption({ original: raw, translated: tr.translatedText });
      } else {
        setError(tr.error ? `Translation note: ${tr.error}` : null);
      }
    }

    try {
      const result = await planSigns(toSign);
      setTokens(result.tokens);
      setSource(result.source);
      if (result.tokens.length === 0) setError("No signable words found.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to plan signs.");
    } finally {
      setPlanning(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    void runPlan(input);
  }

  function handlePreset(p: string) {
    setInput(p);
    void runPlan(p);
  }

  function handleStop() {
    setTokens([]);
    setCurrent(0);
  }

  const currentToken = tokens[current] ?? null;
  const isRunning = tokens.length > 0;
  const progress = tokens.length > 0 ? Math.round(((current + 1) / tokens.length) * 100) : 0;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {open && (
        <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-navy-900 text-white px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span aria-hidden>🧏</span> Sign Language
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white text-base leading-none"
              aria-label="Close sign language avatar"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white py-3">
            <AvatarFigure token={currentToken} />
            <div className="w-full px-3 mt-1">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>
                  {tokens.length > 0
                    ? `Signing ${current + 1} of ${tokens.length}`
                    : "Type a sentence and press Sign"}
                </span>
                {source && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full ${
                      source === "groq" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                    title={source === "groq" ? "Planned by Groq" : "Used local offline tokenizer"}
                  >
                    {source === "groq" ? "Groq" : "Offline"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-3 pt-2 pb-1 flex gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a sentence…"
              className="flex-1 text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              aria-label="Sentence to sign"
            />
            <button
              type="submit"
              disabled={planning || !input.trim()}
              className="text-xs font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white px-3 py-2 rounded-lg"
            >
              {planning || isTranslating ? "…" : "Sign"}
            </button>
            {isRunning && (
              <button
                type="button"
                onClick={handleStop}
                className="text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-2 rounded-lg"
                title="Stop signing"
              >
                Stop
              </button>
            )}
          </form>

          {sourceLang !== "en" && (translatedCaption || isTranslating) && (
            <div className="px-3 pb-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] leading-snug">
                {isTranslating ? (
                  <span className="text-slate-500">Translating via Bhashini…</span>
                ) : translatedCaption ? (
                  <>
                    <div className="text-slate-400">
                      <span className="uppercase tracking-wide text-[8px] font-semibold">You said</span>{" "}
                      <span className="italic">{translatedCaption.original}</span>
                    </div>
                    <div className="text-navy-900 mt-0.5">
                      <span className="uppercase tracking-wide text-[8px] font-semibold text-teal-700">Signing</span>{" "}
                      {translatedCaption.translated}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {PRESET_PHRASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePreset(p)}
                className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full"
              >
                {p.length > 22 ? p.slice(0, 22) + "…" : p}
              </button>
            ))}
          </div>

          {showStepCaption && text && (
            <div className="px-3 pb-2.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">
                  This step
                </span>
                <button
                  type="button"
                  onClick={() => setShowStepCaption(false)}
                  className="text-slate-300 hover:text-slate-500 text-xs"
                  aria-label="Hide step caption"
                >
                  ×
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {text}
              </p>
              {autoSign && (
                <button
                  type="button"
                  onClick={() => runPlan(text)}
                  className="mt-1.5 w-full text-[10px] font-semibold text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline"
                >
                  Sign this instruction
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="px-3 pb-2.5 text-[10px] text-red-600">{error}</div>
          )}

          <div className="px-3 pb-2.5 -mt-1">
            <p className="text-[9px] text-slate-400 leading-snug">
              Illustrative visual aid, not certified ISL interpretation. Phrases are tokenized with Groq (or a local
              fallback) and finger-spelled for unknown words.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-all active:scale-95 border-2 ${
          open ? "bg-navy-900 border-navy-900 text-white" : "bg-white border-slate-200 text-navy-900 hover:border-navy-300"
        }`}
        title="Sign language avatar"
        aria-label="Toggle sign language avatar"
      >
        {isRunning ? "🧏‍♂️" : "🧏"}
      </button>
    </div>
  );
}

export { KNOWN_PHRASE_LIST };
