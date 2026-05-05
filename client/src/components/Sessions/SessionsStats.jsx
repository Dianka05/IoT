import { Radio, CalendarDays } from "lucide-react";

export default function SessionsStats({ activeCount = 0, totalToday = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            LIVE SESSIONS
          </p>
          <p className="text-4xl font-black text-slate-800 mt-1">
            {activeCount}
          </p>
          <p className="text-xs text-green-600 mt-1 font-medium">
            {activeCount > 0 ? "● System active" : "○ No active sessions"}
          </p>
        </div>
        <div className="bg-orange-100 p-3 rounded-xl">
          <Radio 
            size={26} 
            className={`text-orange-500 ${activeCount > 0 ? "animate-pulse" : ""}`} 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            TOTAL TODAY
          </p>
          <p className="text-4xl font-black text-slate-800 mt-1">
            {totalToday}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Updated just now
          </p>
        </div>
        <div className="bg-slate-100 p-3 rounded-xl">
          <CalendarDays size={26} className="text-slate-500" />
        </div>
      </div>

    </div>
  );
}