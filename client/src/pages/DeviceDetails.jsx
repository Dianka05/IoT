import Sidebar from '../components/sidebar';
import DeviceHeader from '../components/DeviceDetails/DeviceHeader';
import { SessionInfo, TimerCard } from '../components/DeviceDetails/SessionInfo'; 
import StatusFooter from '../components/DeviceDetails/StatusFooter';
import { LayoutDashboard } from 'lucide-react';

const DeviceDetails = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <main className="flex-1 p-10 pb-24">

        <DeviceHeader 
          name="IoT Servo Hub" 
          id="4402-B" 
          firmware="v2.4.0" 
        />

        <div className="mt-10 max-w-2xl">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <LayoutDashboard size={18} className="text-slate-400" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Session Info</h3>
            </div>
            
            <SessionInfo userName="Johnathan Doe" role="Technician L3" />
            <TimerCard timeLeft="14:52" />
          </div>
        </div>

        <StatusFooter />
      </main>
    </div>
  );
};

export default DeviceDetails;