import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const opdData = [
  { time: "8AM", count: 12 }, { time: "9AM", count: 28 }, { time: "10AM", count: 42 },
  { time: "11AM", count: 38 }, { time: "12PM", count: 31 }, { time: "1PM", count: 18 },
  { time: "2PM", count: 24 }, { time: "3PM", count: 35 }, { time: "4PM", count: 29 },
];

export default function PhysicianDashboard() {
  const now = new Date();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">OPD Clinical Dashboard</h1>
            <p className="text-slate-500 mt-1">
              {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              OPD Active
            </div>
            <Link
              to="/physician/queue"
              className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
            >
              Open Queue →
            </Link>
          </div>
        </div>

        <div className="bg-navy-900 rounded-2xl p-6 text-white mb-6">
          <div className="text-sm text-slate-300 mb-1">Today's mission</div>
          <div className="text-2xl font-bold mb-1">
            From 30-minute registration to a <span className="text-orange-400">15-second physician handoff</span>
          </div>
          <div className="text-sm text-slate-400">MediKiosk transforms OPD intake — connecting registration, AI assessment, triage and prescription in one ecosystem.</div>
        </div>

        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: "Priority Cases", value: "8", sub: "Needs immediate attention", color: "border-red-300 bg-red-50", badge: "bg-red-100 text-red-700", icon: "⚠️" },
            { label: "Routine Cases", value: "42", sub: "In white queue", color: "border-teal-300 bg-teal-50", badge: "bg-teal-100 text-teal-700", icon: "🟢" },
            { label: "Average Wait", value: "14 min", sub: "Down from 32 min", color: "border-blue-300 bg-blue-50", badge: "bg-blue-100 text-blue-700", icon: "⏱" },
            { label: "Completed", value: "67", sub: "Today so far", color: "border-slate-200 bg-white", badge: "bg-slate-100 text-slate-600", icon: "✓" },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border-2 p-5 ${card.color}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{card.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.badge}`}>{card.label}</span>
              </div>
              <div className="text-4xl font-black text-navy-900 mb-1">{card.value}</div>
              <div className="text-xs text-slate-500">{card.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">OPD Volume — Today</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={opdData}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e4080" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Priority Queue</h3>
              <Link to="/physician/queue" className="text-xs text-navy-600 hover:text-navy-800">View all →</Link>
            </div>
            <div className="space-y-3">
              {[
                { token: "R-027", name: "Ananya Sharma", complaint: "Fever + fatigue", wait: "2 min", flag: "Pallor" },
                { token: "R-028", name: "Rajesh Kumar", complaint: "Chest tightness", wait: "5 min", flag: "Respiratory" },
                { token: "R-029", name: "Priya Singh", complaint: "Severe headache", wait: "8 min", flag: "Neurological" },
              ].map((p) => (
                <Link
                  key={p.token}
                  to="/physician/handoff"
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 hover:border-red-300 transition-all group"
                >
                  <div className="text-red-600 font-black text-sm w-10 shrink-0">{p.token}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 truncate">{p.complaint}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-red-600 font-semibold">{p.flag}</div>
                    <div className="text-xs text-slate-400">{p.wait}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
