import { Router } from 'lucide-react';

const DeviceHeader = ({ name, id, firmware }) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-center">
    <div className="flex items-center gap-5">
      <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
        <Router size={32} strokeWidth={1.5} />
      </div>
      <div>
        <h1 className="text-2xl font-black text-slate-800">{name} <span className="text-slate-400 ml-1">#{id}</span></h1>
        <p className="text-sm text-slate-400 font-bold mt-1">
          Industrial Servo Controller • Firmware {firmware}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">System Operational</span>
        </div>
      </div>
    </div>

    <div className="flex gap-3">
      <div className="bg-green-50 shrink-0 border border-green-100 px-6 py-3 rounded-xl text-center">
        <p className="text-[8px] font-black text-green-600/50 uppercase tracking-widest mb-1">Device Status</p>
        <p className="text-sm font-black text-green-600 uppercase">Online</p>
      </div>
      <div className="bg-green-50 shrink-0 border border-green-100 px-6 py-3 rounded-xl text-center">
        <p className="text-[8px] font-black text-green-600/50 uppercase tracking-widest mb-1">Active Session</p>
        <p className="text-sm font-black text-green-600 uppercase">Connected</p>
      </div>
    </div>
  </div>
);

export default DeviceHeader;