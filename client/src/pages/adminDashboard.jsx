import React from 'react';
import Sidebar from '../components/sidebar';
import StatCard from '../components/adminDashboard/StatCard';
import EquipmentTable from '../components/adminDashboard/EquipmentTable';
import LiveActivity from '../components/adminDashboard/LiveActivity';
import { Users, Box, AlertTriangle, Activity, UserPlus, Fingerprint, ShieldCheck } from 'lucide-react';

const QuickActionBtn = ({ icon: Icon, label }) => (
  <button className="flex-1 min-w-[120px] bg-white border border-slate-100 p-4 md:p-6 rounded-[24px] flex flex-col items-center gap-3 hover:bg-slate-50 transition-all group shadow-sm active:scale-95">
    <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
      <Icon size={24} className="text-slate-600" />
    </div>
    <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">{label}</span>
  </button>
);

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar isAdmin={true} />

      <main className="flex-1 p-4 sm:p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto">
        <div className="mb-10 pl-16 md:pl-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-[1000] text-slate-800 uppercase tracking-tight leading-tight">
            System Overview
          </h1>
          <p className="text-slate-400 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">
            Welcome back, Admin
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-10">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={Activity} label="Active Sessions" value="124" trend="+12%" iconBg="bg-orange-50" />
              <StatCard icon={Users} label="Registered Users" value="1,850" status="Stable" iconBg="bg-blue-50" />
              <StatCard icon={Box} label="Equipment Units" value="422" trend="✓ Online" iconBg="bg-green-50" />
              <StatCard icon={AlertTriangle} label="Security Alerts" value="3" trend="Attention" iconBg="bg-red-50" />
            </div>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.15em]">Quick Management Actions</h3>
              </div>
              <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-4">
                <QuickActionBtn icon={UserPlus} label="Add User" />
                <QuickActionBtn icon={Fingerprint} label="Assign RFID" />
                <QuickActionBtn icon={ShieldCheck} label="Security Logs" />
              </div>
            </section>

            <section className="overflow-hidden">
              <EquipmentTable />
            </section>
          </div>

          <div className="col-span-12 lg:col-span-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.15em]">Live Activity Log</h3>
            </div>
            <LiveActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;