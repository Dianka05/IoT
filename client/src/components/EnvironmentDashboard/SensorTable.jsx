import { Radio } from 'lucide-react';

const SensorTable = () => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-50 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-orange-500" />
          <h3 className="font-black text-slate-800 uppercase text-[11px] md:text-xs tracking-widest">
            Live Sensor Readings
          </h3>
        </div>
        <span className="px-2 py-1 bg-blue-50 text-blue-500 text-[9px] font-black rounded-md tracking-widest uppercase">Live</span>
      </div>

      {/* Контейнер для горизонтального скролла на узких экранах */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-6 py-4">Sensor Name</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Ambient Temp. (T1)', value: '24.52 °C', status: 'normal', time: '0.4s ago' },
              { name: 'Exhaust Temp. (T2)', value: '28.10 °C', status: 'normal', time: 'Active' },
              { name: 'Humidity (H1)', value: '68.22 %', status: 'warning', time: '1.2s ago' },
            ].map((s, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 text-sm font-black text-slate-700">{s.name}</td>
                <td className={`px-6 py-5 text-sm font-bold ${s.status === 'warning' ? 'text-yellow-500' : 'text-slate-600'}`}>{s.value}</td>
                <td className="px-6 py-5">
                  <div className={`w-2 h-2 rounded-full mx-auto ${s.status === 'warning' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`}></div>
                </td>
                <td className="px-6 py-5 text-right text-[11px] font-bold text-slate-300">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorTable;