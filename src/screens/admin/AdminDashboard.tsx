import DashboardLayout from "../../components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const opdVolume = [
  { day: "Mon", count: 142 }, { day: "Tue", count: 168 }, { day: "Wed", count: 195 },
  { day: "Thu", count: 178 }, { day: "Fri", count: 212 }, { day: "Sat", count: 98 },
];
const queueData = [
  { name: "Red Queue", value: 8, color: "#dc2626" },
  { name: "White Queue", value: 42, color: "#0d9488" },
];
const waitTime = [
  { month: "Jan", before: 32, after: 14 }, { month: "Feb", before: 30, after: 12 },
  { month: "Mar", before: 34, after: 11 }, { month: "Apr", before: 29, after: 13 },
  { month: "May", before: 31, after: 10 }, { month: "Jun", before: 28, after: 9 },
];
const regType = [
  { name: "ABHA Digital", value: 62, color: "#1e4080" },
  { name: "Walk-in / Paper", value: 38, color: "#64748b" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Hospital Health Dashboard</h1>
          <p className="text-slate-500 mt-1">District Government Hospital — Administrative Analytics</p>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-8">
          {[
            { label: "Registered Today", value: "247", icon: "👥", color: "bg-navy-50 border-navy-200" },
            { label: "AI Assessments", value: "189", icon: "🤖", color: "bg-orange-50 border-orange-200" },
            { label: "Avg Wait Time", value: "14 min", icon: "⏱", color: "bg-teal-50 border-teal-200" },
            { label: "Priority Cases", value: "8", icon: "⚠️", color: "bg-red-50 border-red-200" },
            { label: "Completed", value: "67", icon: "✓", color: "bg-green-50 border-green-200" },
            { label: "Rx Fulfillment", value: "94%", icon: "💊", color: "bg-purple-50 border-purple-200" },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border-2 p-4 ${card.color}`}>
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="text-3xl font-black text-navy-900">{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">OPD Volume — This Week</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={opdVolume}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e4080" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-1">Average Wait Time (min)</h3>
            <p className="text-xs text-slate-400 mb-4">Before vs. after MediKiosk deployment</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={waitTime}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="before" stroke="#dc2626" strokeWidth={2} dot={false} name="Before MediKiosk" />
                <Line type="monotone" dataKey="after" stroke="#0d9488" strokeWidth={2} dot={false} name="After MediKiosk" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Queue Distribution</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={queueData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                    {queueData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {queueData.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{d.name}</div>
                      <div className="text-2xl font-black" style={{ color: d.color }}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Digital vs Walk-in Registration</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={regType} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                    {regType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {regType.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{d.name}</div>
                      <div className="text-2xl font-black" style={{ color: d.color }}>{d.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
