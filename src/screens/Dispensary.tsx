import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dispensary() {
  const [dispensed, setDispensed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login/jan-aushadhi", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">💊</span>
            </div>
            <div>
              <div className="text-xl font-bold text-navy-900">Jan Aushadhi Dispensary</div>
              <div className="text-sm text-slate-500">District Government Hospital</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-slate-500">{user.name}</span>}
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">Log Out</button>
            <Link to="/opd" className="text-sm text-navy-600 hover:text-navy-800 font-medium">← Back to Home</Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending", value: "12", color: "bg-orange-50 border-orange-200 text-orange-700" },
            { label: "Dispensed Today", value: "48", color: "bg-teal-50 border-teal-200 text-teal-700" },
            { label: "Fulfillment Rate", value: "94%", color: "bg-navy-50 border-navy-200 text-navy-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border-2 p-5 ${s.color}`}>
              <div className="text-3xl font-black text-navy-900">{s.value}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className={`bg-white rounded-2xl border-2 overflow-hidden mb-6 ${dispensed ? "border-teal-300" : "border-slate-200"}`}>
          <div className={`px-6 py-4 flex items-center justify-between ${dispensed ? "bg-teal-50" : "bg-navy-900"}`}>
            <div className="flex items-center gap-3">
              <div className={`font-black text-2xl ${dispensed ? "text-teal-700" : "text-orange-400"}`}>A-142</div>
              <div>
                <div className={`font-bold ${dispensed ? "text-teal-800" : "text-white"}`}>Ananya Sharma</div>
                <div className={`text-sm ${dispensed ? "text-teal-600" : "text-slate-300"}`}>34 years • OPD-2024-08432</div>
              </div>
            </div>
            <div className="text-right">
              {dispensed ? (
                <span className="bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-sm">
                  ✓ Dispensed
                </span>
              ) : (
                <span className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-sm animate-pulse">
                  New Prescription
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Prescription Items</div>
            <table className="w-full mb-5">
              <thead className="border-b border-slate-100">
                <tr>
                  {["Medicine", "Qty", "Duration", "Status"].map((h) => (
                    <th key={h} className="text-left pb-2 text-xs font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { med: "Paracetamol 500mg", qty: "6 tabs", dur: "3 days", available: true },
                  { med: "Cetirizine 10mg", qty: "5 tabs", dur: "5 days", available: true },
                ].map((row) => (
                  <tr key={row.med} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-800">{row.med}</td>
                    <td className="py-3 text-slate-600">{row.qty}</td>
                    <td className="py-3 text-slate-500 text-sm">{row.dur}</td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.available ? "bg-teal-100 text-teal-700" : "bg-red-100 text-red-700"}`}>
                        {row.available ? "Available" : "Out of stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-4 items-center">
              {!dispensed ? (
                <button
                  onClick={() => setDispensed(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all shadow-lg active:scale-95"
                >
                  ✓ Dispense Order
                </button>
              ) : (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl px-6 py-4 flex-1">
                  <div className="font-bold text-teal-700">Dispensary Fulfillment</div>
                  <div className="text-teal-600 text-sm mt-1">Status: Ready for collection — Patient A-142 notified</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">Pending Prescriptions</h3>
          {[
            { token: "A-140", name: "Mohan Das", items: 2, time: "5 min ago" },
            { token: "A-141", name: "Sunita Rao", items: 1, time: "8 min ago" },
            { token: "A-143", name: "Vikram Patel", items: 3, time: "12 min ago" },
          ].map((p) => (
            <div key={p.token} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
              <div className="text-teal-600 font-black">{p.token}</div>
              <div className="flex-1 font-medium text-slate-700">{p.name}</div>
              <div className="text-sm text-slate-500">{p.items} item(s)</div>
              <div className="text-xs text-slate-400">{p.time}</div>
              <button className="bg-navy-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">Process</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
