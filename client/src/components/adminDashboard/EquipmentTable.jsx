import React, { useState } from 'react';
import { Printer, Microscope, Beaker, Laptop, Cpu, ChevronDown, ChevronUp } from 'lucide-react';

const EquipmentTable = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allDevices = [
    { name: '3D Printer Cluster A', loc: 'Lab 4, Wing B', status: 'IN USE', icon: Printer, progress: 70 },
    { name: 'Nimbus 2000', loc: 'Hogwarts', status: 'IDLE', icon: Microscope, progress: 0 },
    { name: 'Spectral Analyzer', loc: 'Bio Lab 1', status: 'IN USE', icon: Beaker, progress: 45 },
    { name: 'Workstation GPU-01', loc: 'Server Room', status: 'IN USE', icon: Laptop, progress: 90 },
    { name: 'Logic Analyzer', loc: 'Lab 2, Wing A', status: 'IDLE', icon: Cpu, progress: 0 },
    { name: 'Laser Cutter X', loc: 'Workshop', status: 'IN USE', icon: Printer, progress: 20 },
  ];

  const displayedDevices = isExpanded ? allDevices : allDevices.slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-[0.15em]">
          Active Equipment Status
        </h3>
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
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        
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
              {displayedDevices.map((device, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                        <device.icon size={18} />
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
                      device.status === 'IN USE' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-slate-100 text-slate-400'
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
                        Ready
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EquipmentTable;