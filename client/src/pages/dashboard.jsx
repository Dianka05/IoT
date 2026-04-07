import Sidebar from '../components/sidebar';
import StatusBadge from '../components/StatusBadge';
import SessionCard from '../components/SessionCard';
import LockControl from '../components/LockControl';
import ActivityLog from '../components/ActivityLog';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-[900] text-[#1e293b] tracking-tight uppercase">
            System Overview
          </h1>
          <StatusBadge isOnline={true} />
        </header>

        <div className="max-w-5xl space-y-6">
          <SessionCard 
            id="XXXXX" 
            technician="Technician • Company/Sector" 
            timeLeft="04:25:00" 
          />
          
          <LockControl status="LOCKED" />
          
          <ActivityLog />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;