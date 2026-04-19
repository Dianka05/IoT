import React, { useState } from 'react';
import { Clock, LogIn, LogOut, Ban, ChevronDown, ChevronUp } from 'lucide-react';

const ActivityRow = ({ icon, title, desc, time, bg }) => (
  <div className="flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 transition-colors rounded-[20px] cursor-pointer group mb-2 last:mb-0">
    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
      {/* Иконка: чуть меньше на мобилках */}
      <div className={`shrink-0 p-2.5 md:p-3 ${bg} rounded-xl md:rounded-full transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon, { size: window.innerWidth < 768 ? 16 : 18 })}
      </div>
      
      <div className="min-w-0">
        <h4 className="font-black text-slate-800 text-sm md:text-base truncate">{title}</h4>
        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-tight truncate">{desc}</p>
      </div>
    </div>

    <p className="shrink-0 text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">
      {time}
    </p>
  </div>
);

const ActivityLog = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allActivities = [
    { id: 1, icon: <LogIn className="text-green-600" />, title: "Session started", desc: "Tech ID: xxxx • Station 04", time: "10:15 AM", bg: "bg-green-50" },
    { id: 2, icon: <LogOut className="text-slate-500" />, title: "Session ended", desc: "Station 01", time: "09:42 AM", bg: "bg-slate-50" },
    { id: 3, icon: <Ban className="text-red-500" />, title: "Access denied", desc: "Restricted Area", time: "04:30 PM", bg: "bg-red-50" },
    { id: 4, icon: <LogIn className="text-green-600" />, title: "Maintenance log", desc: "System check completed", time: "02:15 PM", bg: "bg-green-50" },
    { id: 5, icon: <LogOut className="text-slate-500" />, title: "Gate closed", desc: "Manual override", time: "01:05 PM", bg: "bg-slate-50" },
  ];

  const initialCount = 1; 
  const displayedActivities = isExpanded ? allActivities : allActivities.slice(0, initialCount);

  return (
    <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <Clock size={18} />
          </div>
          <h3 className="text-xs md:text-sm font-[1000] text-[#0f172a] uppercase tracking-[0.15em]">
            Recent Activity
          </h3>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-orange-500 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-orange-600 transition-colors"
        >
          {isExpanded ? (
            <><ChevronUp size={14} /> Show Less</>
          ) : (
            <><ChevronDown size={14} /> View All</>
          )}
        </button>
      </div>

      <div className="flex flex-col">
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
    </section>
  );
};

export default ActivityLog;