import { useState } from 'react'; 
import DeviceHeader from '../components/DeviceDetails/DeviceHeader';
import { SessionInfo, TimerCard } from '../components/DeviceDetails/SessionInfo'; 
import StatusFooter from '../components/DeviceDetails/StatusFooter';
import PageShell from '../components/pageShell';
import SurfaceCard from '../components/surfaceCard';
import { LayoutDashboard, Menu } from 'lucide-react';

const DeviceDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <PageShell
      sidebarOpen={isSidebarOpen}
      setSidebarOpen={setIsSidebarOpen}
      shellClassName="flex min-h-screen bg-[#f8fafc]"
      mainClassName="flex-1 p-6 pb-24 md:p-10"
      contentClassName=""
    >
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden mb-6 p-2 bg-white rounded-xl border border-slate-100 text-slate-600 shadow-sm"
        >
          <Menu size={24} />
        </button>

        <DeviceHeader 
          name="IoT Servo Hub" 
          id="4402-B" 
          firmware="v2.4.0" 
        />

        <div className="mt-10 max-w-2xl">
          <SurfaceCard className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-8">
              <LayoutDashboard size={18} className="text-slate-400" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">
                Session Info
              </h3>
            </div>
            
            <SessionInfo userName="Johnathan Doe" role="Technician L3" />
            <TimerCard timeLeft="14:52" />
          </SurfaceCard>
        </div>

        <StatusFooter />
    </PageShell>
  );
};

export default DeviceDetails;
