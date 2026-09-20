import { useNavigate } from "react-router-dom";
import KioskLayout from "../../components/KioskLayout";
import { useKiosk } from "../../context/KioskContext";

export default function RecordSelect() {
  const navigate = useNavigate();
  const { fetchedRecords, selectedRecordIds, toggleSelectedRecord, setSelectedRecordIds } = useKiosk();

  const availableRecords = fetchedRecords.filter((r) => r.count !== "None reported");
  const allSelected = availableRecords.length > 0 && availableRecords.every((r) => selectedRecordIds.includes(r.id));

  const selectAll = () => setSelectedRecordIds(availableRecords.map((r) => r.id));
  const selectNone = () => setSelectedRecordIds([]);

  return (
    <KioskLayout progress={50} step="Step 6 of 12 — Select Records" showBack backTo="/record-fetch">
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-navy-900 mb-2">Choose Records to Include</h2>
            <p className="text-lg text-slate-500">Select which retrieved documents you'd like to share with your physician today</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {availableRecords.length} document{availableRecords.length !== 1 ? "s" : ""} found in your health locker
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm font-medium text-navy-700 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  Select All
                </button>
                <button
                  onClick={selectNone}
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {availableRecords.map((r) => {
                const isSelected = selectedRecordIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleSelectedRecord(r.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected ? "border-navy-600 bg-navy-50" : "border-slate-200 bg-white hover:border-navy-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <div className="font-semibold text-navy-900">{r.label}</div>
                        <div className="text-xs text-slate-400">{r.count}</div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-navy-600 border-navy-600" : "border-slate-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
              {availableRecords.length === 0 && (
                <div className="text-center text-slate-400 py-6">No previous records were found linked to your account.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate("/scan-documents")}
              className="bg-navy-900 hover:bg-navy-800 text-white text-lg font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              {allSelected ? "Continue with Selected Records →" : `Continue with ${selectedRecordIds.length} Selected →`}
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
