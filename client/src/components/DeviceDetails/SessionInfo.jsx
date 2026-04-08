import React, { useState, useEffect } from 'react';
import { User, Clock } from 'lucide-react';

export const SessionInfo = ({ userName, role }) => (
  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-full shadow-sm text-orange-400">
        <User size={20} />
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current User</p>
        <p className="text-sm font-black text-slate-800">{userName}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Role</p>
      <p className="text-xs font-bold text-slate-600">{role}</p>
    </div>
  </div>
);

export const TimerCard = ({ initialMinutes = 15 }) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) return;

    const timerId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [seconds]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtend = () => {
    setSeconds((prev) => prev + 300); 
  };

  return (
    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between mt-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-full shadow-sm text-orange-400">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Remaining Time</p>
          <p className={`text-2xl font-[1000] tabular-nums transition-colors ${seconds < 60 ? 'text-red-500' : 'text-slate-800'}`}>
            {formatTime(seconds)}
          </p>
        </div>
      </div>
      <button 
        onClick={handleExtend}
        className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 active:scale-95 transition-all px-4 py-2"
      >
        Extend
      </button>
    </div>
  );
};