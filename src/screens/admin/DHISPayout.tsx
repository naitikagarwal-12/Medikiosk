import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function DHISPayout() {
  const [generated, setGenerated] = useState(false);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900">DHIS Financial Payout</h1>
          <p className="text-slate-500 mt-1 text-sm">Administrative module — not visible to patients</p>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: "Encounter Count", value: "247", badge: "bg-slate-100 text-slate-700" },
            { label: "Eligible", value: "231", badge: "bg-teal-100 text-teal-700" },
            { label: "Submitted Claims", value: "218", badge: "bg-blue-100 text-blue-700" },
            { label: "Approved", value: "204", badge: "bg-green-100 text-green-700" },
            { label: "Pending", value: "14", badge: "bg-orange-100 text-orange-700" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-3 ${card.badge}`}>{card.label}</div>
              <div className="text-4xl font-black text-navy-900">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700">Recent Claims</h3>
          </div>
          <table className="w-full">
            <thead className="border-b border-slate-100">
              <tr>
                {["Encounter ID", "Patient", "Date", "Services", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: "OPD-2024-08432", patient: "Ananya Sharma", date: "04 Sep 2024", services: "Consultation + AI Assessment", amount: "₹250", status: "Approved" },
                { id: "OPD-2024-08430", patient: "Rajesh Kumar", date: "04 Sep 2024", services: "Emergency Consultation", amount: "₹500", status: "Pending" },
                { id: "OPD-2024-08429", patient: "Priya Singh", date: "03 Sep 2024", services: "Consultation", amount: "₹200", status: "Approved" },
                { id: "OPD-2024-08425", patient: "Mohan Das", date: "03 Sep 2024", services: "Consultation + Prescription", amount: "₹300", status: "Submitted" },
              ].map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">{row.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{row.patient}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{row.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.services}</td>
                  <td className="px-4 py-3 text-sm font-bold text-navy-900">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      row.status === "Approved" ? "bg-green-100 text-green-700" :
                      row.status === "Pending" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setGenerated(true)}
            className="bg-navy-900 hover:bg-navy-800 text-white font-semibold px-8 py-3 rounded-xl transition-all text-sm"
          >
            Generate Claim →
          </button>
        </div>

        {generated && (
          <div className="mt-4 bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-teal-700">Claim Generated Successfully</div>
              <div className="text-sm text-teal-600">Claim batch #2024-09-04-001 submitted to DHIS portal. Reference: DHIS-24-08432</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
