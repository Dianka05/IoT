import { Radio, CalendarDays } from "lucide-react";

export default function SessionsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            LIVE SESSIONS
          </p>
          <p className="text-4xl font-black text-slate-800 mt-1">12</p>
          <p className="text-xs text-green-600 mt-1 font-medium">↗ +2 since last hour</p>
        </div>

        <div className="bg-orange-100 p-3 rounded-xl">
          <Radio size={26} className="text-orange-500" />
        </div>
      </div>

 
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            TOTAL TODAY
          </p>
          <p className="text-4xl font-black text-slate-800 mt-1">148</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Daily average: 132</p>
        </div>

        <div className="bg-slate-100 p-3 rounded-xl">
          <CalendarDays size={26} className="text-slate-500" />
        </div>
      </div>

    </div>
  );
}
