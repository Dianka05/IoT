import { Wifi, Thermometer, Zap, Activity } from 'lucide-react';

const StatusFooter = () => (
  <div className={`
    fixed bottom-0 right-0 z-30
    left-0 md:left-72 
    bg-white/80 backdrop-blur-md border-t border-slate-100 
    px-4 md:px-8 py-3 
    flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0
  `}>
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      <div className="flex items-center gap-2 text-slate-400">
        <Wifi size={14} className="shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
          Network: <span className="text-slate-600">Excellent</span>
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-slate-400">
        <Thermometer size={14} className="shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
          Temp: <span className="text-slate-600">32.4°C</span>
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <Zap size={14} className="shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
          Power: <span className="text-slate-600">AC Stable</span>
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2 text-slate-300 border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0 w-full sm:w-auto justify-center">
      <span className="text-[10px] font-bold uppercase tracking-tight">Last heart-beat: 2s ago</span>
      <Activity size={14} className="animate-pulse" />
    </div>
  </div>
);

export default StatusFooter;