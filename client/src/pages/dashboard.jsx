import Sidebar from '../components/sidebar';
import StatusBadge from '../components/dashboard/StatusBadge';
import SessionCard from '../components/dashboard/SessionCard';
import ActivityLog from '../components/dashboard/ActivityLog';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-10">
          <div className="pl-16 md:pl-0"> 
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-[1000] text-[#0f172a] tracking-tight uppercase leading-tight">
              System Overview
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Monitoring Node • Active
            </p>
          </div>
          
          <div className="w-fit ml-16 md:ml-0">
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
      </main>
    </div>
  );
};

export default Dashboard;