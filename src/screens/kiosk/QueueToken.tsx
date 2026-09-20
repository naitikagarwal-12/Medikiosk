import { Link } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

export default function QueueToken() {
  const { triageResult } = useKiosk();
  const isRed = triageResult?.queue === "red";

  return (
    <KioskLayout
      voicePrompt={
        isRed
          ? "Your assessment shows you should be seen urgently. Please proceed directly to the priority queue now."
          : "Registration is complete. Your token number and waiting room are shown on screen — please have a seat and listen for your number to be called."
      }
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-2xl">
          {!isRed ? (
            <div className="text-center">
              <div className="bg-white rounded-3xl border-2 border-teal-200 shadow-xl p-10 mb-6">
                <div className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">WHITE QUEUE</div>
                <div className="text-8xl font-black text-teal-600 mb-4">A-142</div>
                <div className="text-2xl font-bold text-navy-900 mb-6">OPD Room 4</div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-teal-50 rounded-2xl p-4">
                    <div className="text-sm text-teal-600 font-medium">Estimated wait</div>
                    <div className="text-3xl font-black text-teal-700">18 min</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-sm text-slate-500 font-medium">Current token</div>
                    <div className="text-3xl font-black text-slate-700">A-136</div>
                  </div>
                </div>
                <p className="text-slate-500 text-base">
                  Please wait in the OPD waiting area. You will be called when your token is announced.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/mobile"
                  className="bg-navy-900 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-navy-800 transition-all"
                >
                  Track on Mobile App →
                </Link>
                <Link
                  to="/opd"
                  className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all"
                >
                  Registration Complete ✓
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-red-50 rounded-3xl border-2 border-red-300 shadow-xl p-10 mb-6">
                <div className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">RED QUEUE — PRIORITY</div>
                <div className="text-8xl font-black text-red-600 mb-4">R-027</div>
                <div className="bg-red-100 rounded-2xl p-5 mb-6">
                  <div className="text-lg font-bold text-red-800">
                    Please proceed immediately to the designated clinical area.
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  Staff has been alerted about your priority status
                </div>
              </div>
              <Link
                to="/opd"
                className="inline-block bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all"
              >
                Proceed to Priority Area →
              </Link>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
