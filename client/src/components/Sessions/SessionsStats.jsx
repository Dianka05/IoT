import { CalendarDays, Radio } from "lucide-react";

export default function SessionsStats({
  liveSessions = 0,
  totalSessions = 0,
  isOperationsRole = false,
}) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Live Sessions
          </p>
          <p className="mt-1 text-4xl font-black text-slate-800">{liveSessions}</p>
          <p className="mt-1 text-xs font-medium text-green-600">
            {isOperationsRole
              ? "Active and pending in current workspace"
              : "Your active and pending reservations"}
          </p>
        </div>

        <div className="rounded-xl bg-orange-100 p-3">
          <Radio size={26} className="text-orange-500" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Sessions
          </p>
          <p className="mt-1 text-4xl font-black text-slate-800">{totalSessions}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {isOperationsRole
              ? "Sessions returned for current organization"
              : "Sessions returned for your account"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <CalendarDays size={26} className="text-slate-500" />
        </div>
      </div>
    </div>
  );
}
