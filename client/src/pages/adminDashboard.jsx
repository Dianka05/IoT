import { useState } from "react";
import Sidebar from '../components/UsersList/Sidebar';
import StatCard from '../components/adminDashboard/StatCard';
import EquipmentTable from '../components/adminDashboard/EquipmentTable';
import LiveActivity from '../components/adminDashboard/LiveActivity';
import { 
  Users, 
  Box, 
  AlertTriangle, 
  Activity, 
  UserPlus, 
  Fingerprint, 
  ShieldCheck, 
  Menu 
} from 'lucide-react';

const QuickActionBtn = ({ icon: Icon, label }) => (
  <button className="flex-1 bg-white border border-slate-100 p-6 rounded-[24px] flex flex-col items-center gap-3 hover:bg-slate-50 transition-all group shadow-sm active:scale-95">
    <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
      <Icon size={24} className="text-slate-600" />
    </div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
      {label}
    </span>
  </button>
);

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-10 flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600 active:scale-95 transition-transform"
            >
              <Menu size={24} />
            </button>

            <div>
              <h1 className="text-3xl md:text-4xl font-[1000] text-slate-800 uppercase tracking-tight leading-none">
                System Overview
              </h1>
              <p className="text-slate-400 font-bold text-sm mt-1">
                Welcome back, Admin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-10">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Activity} label="Active Sessions" value="124" trend="+12%" iconBg="bg-orange-50" />
                <StatCard icon={Users} label="Registered Users" value="1,850" status="Stable" iconBg="bg-blue-50" />
                <StatCard icon={Box} label="Equipment Units" value="422" trend="✓ Online" iconBg="bg-green-50" />
                <StatCard icon={AlertTriangle} label="Security Alerts" value="3" trend="Attention" iconBg="bg-red-50" />
              </div>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.15em]">
                    Quick Management Actions
                  </h3>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-4">
                  <QuickActionBtn icon={UserPlus} label="Add User" />
                  <QuickActionBtn icon={Fingerprint} label="Assign RFID" />
                  <QuickActionBtn icon={ShieldCheck} label="Security Logs" />
                </div>
              </section>

              <section>
                <EquipmentTable />
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.15em]">
                  Live Activity Log
                </h3>
              </div>
              <LiveActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;