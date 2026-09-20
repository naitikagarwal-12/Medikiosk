import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import VoiceAssistant from "./VoiceAssistant";
import SignLanguageAvatar from "./SignLanguageAvatar";
import { useKiosk } from "../context/KioskContext";
import type { KioskLanguage } from "../context/KioskContext";

const LANG_DISPLAY_NAMES: Record<KioskLanguage, string> = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  mr: "मराठी",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  gu: "ગુજરાતી",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  as: "অসমীয়া",
  ur: "اردو",
};

interface Props {
  children: ReactNode;
  progress?: number;
  step?: string;
  showBack?: boolean;
  backTo?: string;
  voicePrompt?: string;
  onVoiceCommand?: (text: string) => boolean | void;
  nextRoute?: string;
}

export default function KioskLayout({
  children,
  progress,
  step,
  showBack,
  backTo,
  voicePrompt,
  onVoiceCommand,
  nextRoute,
}: Props) {
  const navigate = useNavigate();
  const { language } = useKiosk();

  const handleVoiceFinal = (text: string) => {
    const handled = onVoiceCommand?.(text);
    if (handled) return;
    const proceedIntent = /\b(next|continue|proceed|go ahead|okay|ok)\b/.test(text);
    if (proceedIntent && nextRoute) {
      navigate(nextRoute);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-navy-900 text-white px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">MediKiosk</div>
            <div className="text-xs text-slate-300">Smart OPD Registration & Preliminary Assessment</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm bg-navy-800 hover:bg-navy-700 px-4 py-2 rounded-lg transition-all border border-navy-700">
            <span className="text-base">🔊</span>
            <span>{LANG_DISPLAY_NAMES[language] || "English"}</span>
          </button>
          <button className="w-9 h-9 bg-navy-800 hover:bg-navy-700 rounded-lg flex items-center justify-center transition-all border border-navy-700" title="Accessibility">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button className="w-9 h-9 bg-navy-800 hover:bg-navy-700 rounded-lg flex items-center justify-center transition-all border border-navy-700" title="Help">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {progress !== undefined && (
        <div className="bg-white border-b border-slate-200 px-8 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-600">{step}</span>
            <span className="text-sm text-slate-400">{progress}% complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="bg-white border-t border-slate-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your information is processed securely and shared only for healthcare purposes.
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>District Government Hospital — OPD</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-teal-500 rounded-full inline-block"></span>
            System Online
          </span>
        </div>
        {showBack && (
          <button
            onClick={() => navigate(backTo || "/")}
            className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </footer>

      <VoiceAssistant prompt={voicePrompt ?? step} onFinalTranscript={handleVoiceFinal} />

      <SignLanguageAvatar text={voicePrompt ?? step} sourceLang={language} />
    </div>
  );
}
