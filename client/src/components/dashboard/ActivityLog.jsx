import React, { useState } from 'react';
import { Ban, ChevronDown, ChevronUp, Clock, LogIn, LogOut } from 'lucide-react';
import SurfaceCard from '../surfaceCard';

const defaultActivities = [
  { id: 1, icon: <LogIn className="text-green-600" />, title: "Session started", desc: "Tech ID: xxxx | Station 04", time: "10:15 AM", bg: "bg-green-50" },
  { id: 2, icon: <LogOut className="text-slate-500" />, title: "Session ended", desc: "Station 01", time: "09:42 AM", bg: "bg-slate-50" },
  { id: 3, icon: <Ban className="text-red-500" />, title: "Access denied", desc: "Restricted Area", time: "04:30 PM", bg: "bg-red-50" },
  { id: 4, icon: <LogIn className="text-green-600" />, title: "Maintenance log", desc: "System check completed", time: "02:15 PM", bg: "bg-green-50" },
  { id: 5, icon: <LogOut className="text-slate-500" />, title: "Gate closed", desc: "Manual override", time: "01:05 PM", bg: "bg-slate-50" },
];

function ActivityRow({ icon, title, desc, time, bg }) {
  return (
    <div className="group mb-2 flex cursor-pointer items-center justify-between rounded-[20px] p-3 transition-colors hover:bg-slate-50 last:mb-0 md:p-4">
      <div className="flex items-center gap-3 overflow-hidden md:gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 transition-transform group-hover:scale-110 md:rounded-full md:p-3 ${bg}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>

        <div className="min-w-0">
          <h4 className="truncate text-sm font-black text-slate-800 md:text-base">{title}</h4>
          <p className="truncate text-[10px] font-bold uppercase tracking-tight text-slate-400 md:text-xs">{desc}</p>
        </div>
      </div>

      <p className="ml-4 shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-300 md:text-[10px]">
        {time}
      </p>
    </div>
  );
}

export default function ActivityLog({ items = defaultActivities }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedActivities = isExpanded ? items : items.slice(0, 1);

  return (
    <SurfaceCard as="section" className="p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-orange-50 p-2 text-orange-500">
            <Clock size={18} />
          </div>
          <h3 className="text-xs font-[1000] uppercase tracking-[0.15em] text-[#0f172a] md:text-sm">
            Recent Activity
          </h3>
        </div>

        <button
          onClick={() => setIsExpanded((value) => !value)}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 transition-colors hover:text-orange-600 md:text-xs"
        >
          {isExpanded ? (
            <><ChevronUp size={14} /> Show Less</>
          ) : (
            <><ChevronDown size={14} /> View All</>
          )}
        </button>
      </div>

      <div className="flex flex-col">
        {displayedActivities.length === 0 && (
          <div className="px-2 py-4 text-sm font-semibold text-slate-500">
            No recent activity.
          </div>
        )}

        {displayedActivities.map((item) => (
          <ActivityRow
            key={item.id}
            icon={item.icon}
            title={item.title}
            desc={item.desc}
            time={item.time}
            bg={item.bg}
          />
        ))}
      </div>
    </SurfaceCard>
  );
}
