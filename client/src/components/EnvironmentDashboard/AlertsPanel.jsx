import { AlertTriangle, Info, Droplets } from 'lucide-react';

const AlertsPanel = () => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-50">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle size={20} className="text-red-500" />
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Active Alerts</h3>
      </div>

      <div className="space-y-4">
        {/* Warning Alert */}
        <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-1">
            <Droplets size={16} className="text-yellow-600" />
            <h4 className="text-sm font-black text-slate-800">High Humidity Threshold</h4>
          </div>
          <p className="text-xs font-bold text-slate-500 ml-7">Sensor H1 detected 68.2% (Limit 60%)</p>
          <span className="text-[9px] font-black text-yellow-600 uppercase ml-7 mt-2 block tracking-widest">Critical Level 1</span>
        </div>

        {/* Danger Alert */}
        <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-1">
            <Info size={16} className="text-red-600" />
            <h4 className="text-sm font-black text-slate-800">Fan Unit Faulty</h4>
          </div>
          <p className="text-xs font-bold text-slate-500 ml-7">System fan RPM dropped below 500.</p>
          <span className="text-[9px] font-black text-red-600 uppercase ml-7 mt-2 block tracking-widest">Critical Level 2</span>
        </div>

        <button className="w-full py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-xl transition-colors">
          View Alert History
        </button>
      </div>
    </div>
  );
};

export default AlertsPanel;