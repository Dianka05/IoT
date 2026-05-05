import axios from "axios";
import { Radio, Activity, Info } from "lucide-react";

export default function UserEquipmentGrid({ permissions, onSessionStarted }) {
  
  const handleStartSession = async (device) => {
    try {
      const response = await axios.post('http://localhost:3000/sessions/start', {
        deviceId: device.id,
        userId: "current-user-id" 
      });

      if (response.status === 200 || response.status === 201) {
        alert(`Session started for ${device.name}`);
        if (onSessionStarted) onSessionStarted();
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Error starting session. Check console for details.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {permissions.map((device) => (
        <div key={device.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-orange-500 transition-colors">
              {device.name.includes("Fan") ? <Activity size={24} /> : <Radio size={24} />}
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider ${
              device.status === "FREE" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
            }`}>
              {device.status}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-8">{device.name}</h3>

          <button 
            onClick={() => handleStartSession(device)}
            disabled={device.status !== "FREE"}
            className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
              device.status === "FREE" 
              ? "bg-[#ff6200] text-white hover:bg-[#e55600] shadow-lg shadow-orange-200" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {device.status === "FREE" ? "Start Session" : "In Use"}
          </button>
        </div>
      ))}
    </div>
  );
}