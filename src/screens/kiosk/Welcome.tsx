import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useTranslation, useTranslations } from "../../hooks/useTranslation";

const WELCOME_VOICE_PROMPT =
  "Welcome to the O P D. I can guide you step by step and you can reply by speaking. " +
  "Say 'start' whenever you're ready to begin your registration.";

export default function Welcome() {
  const navigate = useNavigate();

  const { t: heading } = useTranslation("Welcome to OPD");
  const { t: subtitle } = useTranslation(
    "Register faster. Share your symptoms. Get the right care sooner."
  );
  const { t: ctaLabel } = useTranslation("Start Registration");
  const { t: privacyNote } = useTranslation(
    "Your information is processed securely and shared only for healthcare purposes."
  );
  const { texts: featureLabels } = useTranslations([
    "Fast Registration",
    "AI Assessment",
    "15-sec Handoff",
  ]);
  const { texts: featureSubs } = useTranslations([
    "Under 5 minutes",
    "Ayurvedic + Modern",
    "To your physician",
  ]);

  const features = [
    { icon: "⚡", label: featureLabels[0], sub: featureSubs[0] },
    { icon: "🤖", label: featureLabels[1], sub: featureSubs[1] },
    { icon: "👨‍⚕️", label: featureLabels[2], sub: featureSubs[2] },
  ];

  const handleVoiceCommand = (text: string) => {
    if (/\b(start|begin|register|continue|next)\b/.test(text)) {
      navigate("/language");
      return true;
    }
    return false;
  };

  return (
    <KioskLayout voicePrompt={WELCOME_VOICE_PROMPT} onVoiceCommand={handleVoiceCommand} nextRoute="/language">
      <div className="flex-1 flex flex-col items-center justify-start px-8 py-12 min-h-screen">
        <div className="text-center max-w-3xl">  
          <h1 className="text-5xl font-bold text-navy-900 mb-4 leading-tight">
            {heading}
          </h1>
          <p className="text-xl text-slate-500 mb-2 font-medium">
            ओपीडी में आपका स्वागत है
          </p>
          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="grid grid-cols-3 gap-6 mb-12">
            {features.map((f) => (
              <div key={f.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="font-semibold text-navy-900 text-base">{f.label}</div>
                <div className="text-sm text-slate-500 mt-1">{f.sub}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/language")}
              className="bg-navy-900 hover:bg-navy-800 text-white text-xl font-semibold px-12 py-5 rounded-2xl shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              {ctaLabel} →
            </button> 
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {privacyNote}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
