import { useState } from "react";
import Sidebar from '../components/sidebar';
import StatusBadge from '../components/dashboard/StatusBadge';
import SessionCard from '../components/dashboard/SessionCard';
import ActivityLog from '../components/dashboard/ActivityLog';
import { Menu } from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          
          <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center mb-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600 active:scale-95 transition-transform"
              >
                <Menu size={24} />
              </button>

              <div> 
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-[1000] text-[#0f172a] tracking-tight uppercase leading-tight">
                  System Overview
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Monitoring Node • Active
                </p>
              </div>
            </div>
            
            <div className="w-fit">
              <StatusBadge isOnline={true} />
            </div>
          </header>

          <div className="max-w-5xl space-y-6 md:space-y-8">
            <SessionCard 
              id="XXXXX" 
              technician="Technician • Company/Sector" 
              timeLeft="04:23:17" 
            />
            
            <ActivityLog />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;