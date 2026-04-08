import { Wifi, Thermometer, Zap, Activity } from 'lucide-react';

const StatusFooter = () => (
  <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-8 py-3 flex justify-between items-center z-10">
    <div className="flex gap-8">
      <div className="flex items-center gap-2 text-slate-400">
        <Wifi size={14} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Network: <span className="text-slate-600">Excellent</span></span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <Thermometer size={14} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Temp: <span className="text-slate-600">32.4°C</span></span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <Zap size={14} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Power: <span className="text-slate-600">AC Stable</span></span>
      </div>
    </div>
    <div className="flex items-center gap-2 text-slate-300">
      <span className="text-[10px] font-bold uppercase tracking-tight">Last heart-beat: 2s ago</span>
      <Activity size={14} />
    </div>
  </div>
);

export default StatusFooter;