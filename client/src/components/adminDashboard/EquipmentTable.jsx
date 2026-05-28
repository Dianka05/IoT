import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import SurfaceCard from '../surfaceCard';

const statusStyles = {
  'IN USE': 'bg-green-50 text-green-600',
  ACTIVE: 'bg-green-50 text-green-600',
  IDLE: 'bg-slate-100 text-slate-400',
  READY: 'bg-slate-100 text-slate-400',
  MAINTENANCE: 'bg-yellow-50 text-yellow-700',
  OFFLINE: 'bg-red-50 text-red-600',
};

const EquipmentTable = ({ devices = [], loading = false, viewAllHref = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedDevices = isExpanded ? devices : devices.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-[0.15em]">
          Active Equipment Status
        </h3>
        {viewAllHref ? (
          <Link
            to={viewAllHref}
            className="flex items-center gap-1 text-orange-500 text-[10px] font-[1000] uppercase tracking-widest hover:text-orange-600 transition-all"
          >
            <ChevronDown size={14} />
            View All
          </Link>
        ) : (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-orange-500 text-[10px] font-[1000] uppercase tracking-widest hover:text-orange-600 transition-all"
          >
            {isExpanded ? (
              <><ChevronUp size={14} /> Show Less</>
            ) : (
              <><ChevronDown size={14} /> View All</>
            )}
          </button>
        )}
      </div>

      <SurfaceCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Device Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Activity</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Loading equipment...
                  </td>
                </tr>
              )}

              {!loading && displayedDevices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    No equipment found.
                  </td>
                </tr>
              )}

              {!loading && displayedDevices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                        <Cpu size={18} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm whitespace-nowrap">
                        {device.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                    {device.loc}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md whitespace-nowrap ${
                      statusStyles[device.status] || 'bg-slate-100 text-slate-400'
                    }`}>
                      {device.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {device.progress > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${device.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{device.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        {device.status === 'OFFLINE' ? 'Offline' : 'Ready'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
};

export default EquipmentTable;
