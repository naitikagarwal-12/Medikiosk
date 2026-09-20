import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

const questions = [
  {
    step: 1,
    q: "What brings you to the hospital today?",
    options: ["🌡 Fever", "🤧 Cough / Cold", "😣 Pain", "🫁 Stomach / Digestion", "🩹 Skin problem", "😴 Weakness / Fatigue", "🤕 Headache", "Other"],
    multi: true,
  },
  {
    step: 2,
    q: "How long have you had these symptoms?",
    options: ["Less than 1 day", "1–3 days", "3–7 days", "1–2 weeks", "More than 2 weeks"],
    multi: false,
  },
  {
    step: 3,
    q: "How severe are your symptoms?",
    options: ["Mild — I can carry on with daily activities", "Moderate — It affects my daily routine", "Severe — I cannot function normally"],
    multi: false,
  },
  {
    step: 4,
    q: "How is your appetite?",
    options: ["Normal", "Reduced", "No appetite", "Increased", "Nausea when eating"],
    multi: false,
  },
  {
    step: 5,
    q: "How is your digestion / bowel habits?",
    options: ["Normal", "Constipation", "Loose stools / Diarrhea", "Bloating / Gas", "Acidity / Heartburn"],
    multi: true,
  },
  {
    step: 6,
    q: "Do you have any existing medical conditions?",
    options: ["Diabetes", "Hypertension", "Asthma / Respiratory", "Heart disease", "Thyroid", "None known"],
    multi: true,
  },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const { setQuestionnaireAnswers } = useKiosk();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});

  const q = questions[currentStep];

  const toggle = (option: string) => {
    const current = answers[currentStep] || [];
    if (q.multi) {
      setAnswers((a) => ({
        ...a,
        [currentStep]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      }));
    } else {
      setAnswers((a) => ({ ...a, [currentStep]: [option] }));
    }
  };

  const next = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setQuestionnaireAnswers(answers);
      navigate("/consent");
    }
  };

  const selected = answers[currentStep] || [];

  return (
    <KioskLayout
      progress={Math.round(((currentStep + 1) / questions.length) * 60) + 10}
      step={`Step ${currentStep + 1} of ${questions.length} — Symptom Questionnaire`}
      showBack
      backTo={currentStep > 0 ? undefined : "/profile"}
    >
      {currentStep > 0 && (
        <div className="bg-white border-b border-slate-200 px-8 py-3">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            className="flex items-center gap-1 text-sm text-navy-600 hover:text-navy-800"
          >
            ← Previous question
          </button>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">Tell us how you're feeling</h2>
            <p className="text-slate-500">
              Question {currentStep + 1} of {questions.length}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">
            <h3 className="text-2xl font-semibold text-navy-900 mb-6">{q.q}</h3>
            {q.multi && (
              <p className="text-sm text-slate-400 mb-4">Select all that apply</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={`text-left px-5 py-4 rounded-2xl border-2 text-lg font-medium transition-all ${
                      isSelected
                        ? "border-navy-600 bg-navy-50 text-navy-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-navy-200 hover:bg-slate-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={next}
              disabled={selected.length === 0}
              className="bg-navy-900 hover:bg-navy-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              {currentStep < questions.length - 1 ? "Next →" : "Complete Questionnaire →"}
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
