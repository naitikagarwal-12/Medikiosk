import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "ur", name: "Urdu", native: "اردو" },
];

export default function LanguageSelection() {
  const [selected, setSelected] = useState("en");
  const navigate = useNavigate();
  const { setLanguage } = useKiosk();

  function choose(code: string) {
    setSelected(code);
    setLanguage(code as any);
  }

  return (
    <KioskLayout
      progress={8}
      step="Step 1 of 12 — Language Selection"
      showBack
      backTo="/"
      voicePrompt="Step 1: choose your preferred language by tapping a card, or tell me which language you'd like — for example, say 'Hindi' or 'English'."
      nextRoute="/data-consent"
    >
      <div className="flex-1 flex flex-col justify-start items-center min-h-screen px-8 py-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">Choose Your Language</h2>
            <p className="text-lg text-slate-500">अपनी भाषा चुनें / ভাষা বেছে নিন</p>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-8">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => choose(lang.code)}
                className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 transition-all ${
                  selected === lang.code
                    ? "border-navy-600 bg-navy-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-navy-300 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mb-3 flex items-center justify-center ${
                    selected === lang.code ? "border-navy-600 bg-navy-600" : "border-slate-300"
                  }`}
                >
                  {selected === lang.code && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-2xl font-bold text-navy-900 mb-1">{lang.native}</span>
                <span className="text-sm text-slate-500">{lang.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4"> 
            <button
              onClick={() => navigate("/data-consent")}
              className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
