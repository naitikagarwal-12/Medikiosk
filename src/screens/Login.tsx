import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, Role, ROLE_HOME, ROLE_LABEL } from "../context/AuthContext";

const staffRoles: { role: Role; icon: string; hint: string }[] = [
  { role: "physician", icon: "🩺", hint: "Queue, patients, encounters, AI assessments" },
  { role: "jan_aushadhi", icon: "💊", hint: "Dispensary & prescriptions" },
];

const STAFF_LOGIN_ROUTE: Record<string, string> = {
  physician: "/login/doctor",
  jan_aushadhi: "/login/jan-aushadhi",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupPatient, user } = useAuth();

  const [tab] = useState<"patient">("patient");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const fromPath = (location.state as any)?.from as string | undefined;

  if (user) {
    navigate(fromPath || ROLE_HOME[user.role], { replace: true });
    return null;
  }

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = signupPatient(name, mobile);
    if (!ok) {
      setError("Please enter your name and a valid 10-digit mobile number.");
      return;
    }
    navigate(fromPath || ROLE_HOME.patient, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">MediKiosk</h1>
          <p className="text-slate-500 text-sm mt-1">Smart OPD Registration & Preliminary Assessment</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setError("")}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold transition-all border-2 ${
                tab === "patient"
                  ? "bg-navy-900 border-navy-900 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">🧑‍🤝‍🧑</span>
              Patient
            </button>
            {staffRoles.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => navigate(STAFF_LOGIN_ROUTE[r.role])}
                className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold transition-all border-2 bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              >
                <span className="text-xl">{r.icon}</span>
                {ROLE_LABEL[r.role]}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 -mt-3 mb-5 text-center">
            New here? Sign up in seconds to start your OPD visit.
          </p>

          <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  autoComplete="tel"
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Sign Up & Continue to OPD
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
