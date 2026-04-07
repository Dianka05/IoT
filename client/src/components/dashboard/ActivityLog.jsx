import React, { useState } from 'react';
import { Clock, LogIn, LogOut, Ban } from 'lucide-react';

const ActivityRow = ({ icon, title, desc, time, bg }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-2xl cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${bg} rounded-full transition-transform group-hover:scale-110`}>{icon}</div>
      <div>
        <h4 className="font-bold text-slate-700">{title}</h4>
        <p className="text-xs text-slate-400 font-medium">{desc}</p>
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{time}</p>
  </div>
);

const ActivityLog = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allActivities = [
    { id: 1, icon: <LogIn size={18} className="text-green-600" />, title: "Session started", desc: "Tech ID: xxxx • Station 04", time: "10:15 AM", bg: "bg-green-50" },
    { id: 2, icon: <LogOut size={18} className="text-slate-500" />, title: "Session ended", desc: "Station 01", time: "09:42 AM", bg: "bg-slate-50" },
    { id: 3, icon: <Ban size={18} className="text-red-500" />, title: "Access denied", desc: "Restricted Area", time: "04:30 PM", bg: "bg-red-50" },
    { id: 4, icon: <LogIn size={18} className="text-green-600" />, title: "Maintenance log", desc: "System check completed", time: "02:15 PM", bg: "bg-green-50" },
    { id: 5, icon: <LogOut size={18} className="text-slate-500" />, title: "Gate closed", desc: "Manual override", time: "01:05 PM", bg: "bg-slate-50" },
  ];

  const displayedActivities = isExpanded ? allActivities : allActivities.slice(0, 1);

  return (
    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 transition-all duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Clock className="text-orange-500" size={20} />
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Activity</h3>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-orange-500 text-sm font-black uppercase tracking-widest hover:text-orange-600 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'View All'}
        </button>
      </div>

      <div className="space-y-1">
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