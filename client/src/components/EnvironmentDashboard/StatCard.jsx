import { Thermometer, Droplets } from 'lucide-react';

const StatCard = ({ label, value, unit, limit, trend, status, type }) => {
  const isWarning = status === "WARNING";
  const Icon = type === "temp" ? Thermometer : Droplets;

  return (
    <div className={`bg-white rounded-[24px] p-6 md:p-8 border-l-4 shadow-sm relative overflow-hidden ${isWarning ? 'border-yellow-400' : 'border-green-500'}`}>
      <div className="flex justify-between items-start mb-6 md:mb-10">
        <div className={`p-2.5 md:p-3 rounded-xl ${isWarning ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
          <Icon size={24} className="md:w-7 md:h-7" />
        </div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${isWarning ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight">
          {value}<span className="text-2xl md:text-3xl text-slate-300 ml-1 font-medium">{unit}</span>
        </h2>
      </div>

      <div className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
        <span className="text-slate-400">Limit: {limit}</span>
        <span className={trend.startsWith('+') ? 'text-orange-500' : 'text-green-500'}>
           {trend}
        </span>
      </div>
    </div>
  );
};

export default StatCard;