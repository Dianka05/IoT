import { Router } from 'lucide-react';

const DeviceHeader = ({ name, id, firmware }) => (
  <div className="bg-white p-5 md:p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
    
    <div className="flex items-center gap-4 md:gap-5 w-full">
      <div className="p-3 md:p-4 bg-orange-50 rounded-2xl text-orange-500 shrink-0">
        <Router size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center flex-wrap gap-1">
          {name} <span className="text-slate-400 font-bold">#{id}</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 font-bold mt-1 leading-tight">
          Industrial Servo Controller • FW {firmware}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
          <span className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest">
            System Operational
          </span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-5 lg:pt-0">
      <div className="bg-green-50 border border-green-100 px-4 md:px-6 py-3 rounded-xl text-center flex-1 lg:flex-none">
        <p className="text-[8px] font-black text-green-600/50 uppercase tracking-widest mb-1">Status</p>
        <p className="text-xs md:text-sm font-black text-green-600 uppercase">Online</p>
      </div>
      <div className="bg-green-50 border border-green-100 px-4 md:px-6 py-3 rounded-xl text-center flex-1 lg:flex-none">
        <p className="text-[8px] font-black text-green-600/50 uppercase tracking-widest mb-1">Session</p>
        <p className="text-xs md:text-sm font-black text-green-600 uppercase">Connected</p>
      </div>
    </div>

  </div>
);

export default DeviceHeader;