import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";
import type { TriageResult } from "../../context/KioskContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function Triage() {
  const navigate = useNavigate();
  const { triageResult, computeTriage } = useKiosk();

  const { t: pageTitle } = useTranslation("AI Triage Decision");
  const { t: pageSubtitle } = useTranslation(
    "Automatically determined from your questionnaire and AI-assisted observations — not chosen by the patient"
  );
  const { t: priorityAlert } = useTranslation("PRIORITY ALERT");
  const { t: priorityHeading } = useTranslation("Priority Clinical Attention Required");
  const { t: prioritySubtitle } = useTranslation("AI has flagged indicators requiring immediate clinician review");
  const { t: flaggedLabel } = useTranslation("Flagged Warning Indicators");
  const { t: flaggedDisclaimer } = useTranslation(
    "These observations are AI-flagged for clinician attention — not independent diagnoses."
  );
  const { t: redQueueLabel } = useTranslation("RED QUEUE");
  const { t: redQueueAction } = useTranslation("Please proceed to the priority clinical queue");
  const { t: viewPriorityBtn } = useTranslation("View Priority Instructions");
  const { t: assessmentComplete } = useTranslation("ASSESSMENT COMPLETE");
  const { t: routineHeading } = useTranslation("Routine Clinical Case");
  const { t: routineSubtitle } = useTranslation("No major red-flag indicators detected by AI assessment");
  const { t: assessmentNotesLabel } = useTranslation("Assessment Notes");
  const { t: whiteQueueLabel } = useTranslation("WHITE QUEUE");
  const { t: estimatedWait } = useTranslation("Estimated Waiting Time: 18 min");
  const { t: joinRoutineBtn } = useTranslation("Join Routine Queue");

  useEffect(() => {
    if (!triageResult) computeTriage();
  }, []);

  const result = (triageResult ?? computeTriage()) as TriageResult;
  const isRed = result.queue === "red";

  return (
    <KioskLayout progress={100} step="Triage Decision">
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-navy-900 mb-1">{pageTitle}</h2>
            <p className="text-slate-500 text-sm">
              {pageSubtitle}
            </p>
          </div>

          {isRed ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">⚠️</div>
                <div>
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">{priorityAlert}</div>
                  <h3 className="text-2xl font-bold text-red-800">{priorityHeading}</h3>
                  <p className="text-red-600 text-sm mt-1">{prioritySubtitle}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 p-5 mb-6">
                <div className="text-sm font-semibold text-red-700 mb-3">{flaggedLabel}</div>
                <div className="space-y-2">
                  {result.flags.map((flag) => (
                    <div key={flag} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 shrink-0">●</span>
                      <span className="text-sm text-slate-700">{flag}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-400 italic">
                  {flaggedDisclaimer}
                </div>
              </div>

              <div className="bg-red-100 rounded-2xl p-5 text-center mb-6">
                <div className="text-xs font-bold text-red-600 uppercase mb-1">{redQueueLabel}</div>
                <div className="text-4xl font-black text-red-700">R-027</div>
                <div className="text-red-600 font-semibold mt-1">{redQueueAction}</div>
              </div>

              <button
                onClick={() => navigate("/queue-token")}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-5 rounded-2xl transition-all shadow-lg"
              >
                {viewPriorityBtn} →
              </button>
            </div>
          ) : (
            <div className="bg-teal-50 border-2 border-teal-300 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">✓</div>
                <div>
                  <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">{assessmentComplete}</div>
                  <h3 className="text-2xl font-bold text-teal-800">{routineHeading}</h3>
                  <p className="text-teal-600 text-sm mt-1">{routineSubtitle}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-teal-200 p-5 mb-6">
                <div className="text-sm font-semibold text-teal-700 mb-3">{assessmentNotesLabel}</div>
                <div className="space-y-2">
                  {result.flags.map((flag) => (
                    <div key={flag} className="flex items-start gap-2">
                      <span className="text-teal-500 mt-0.5 shrink-0">●</span>
                      <span className="text-sm text-slate-700">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-teal-200 p-5 mb-6 text-center">
                <div className="text-xs font-bold text-teal-600 uppercase mb-1">{whiteQueueLabel}</div>
                <div className="text-4xl font-black text-teal-700">A-142</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-bold text-teal-700">{estimatedWait}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/queue-token")}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xl font-bold py-5 rounded-2xl transition-all shadow-lg"
              >
                {joinRoutineBtn} →
              </button>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
