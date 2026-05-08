import { useState } from "react";
import { MapPin, Menu, RefreshCw } from 'lucide-react';
import AlertsPanel from '../components/EnvironmentDashboard/AlertsPanel';
import SensorTable from '../components/EnvironmentDashboard/SensorTable';
import StatCard from '../components/EnvironmentDashboard/StatCard';
import SystemIdentity from '../components/EnvironmentDashboard/SystemIdentity';
import PageShell from '../components/pageShell';

export default function EnvironmentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      shellClassName="flex min-h-screen bg-[#f8fafc]"
      mainClassName="w-full flex-1 overflow-y-auto p-4 md:p-8"
    >
      <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-95 transition-transform"
          >
            <Menu size={24} className="text-slate-600" />
          </button>

          <div>
            <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-800 md:text-3xl">
              Environment Dashboard
            </h1>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <MapPin size={12} /> XZY SECTOR
            </div>
          </div>
        </div>

        <button className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 active:scale-95 md:px-6 md:text-sm">
          <RefreshCw size={16} className="md:w-[18px]" />
          <span>Force Sync</span>
        </button>
      </header>

      <div className="grid grid-cols-12 gap-5 md:gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <StatCard
              type="temp"
              label="Internal Temperature"
              value="24.5"
              unit="C"
              limit="15C - 35C"
              trend="-0.4C / 1hr"
              status="NORMAL"
            />
            <StatCard
              type="humidity"
              label="Relative Humidity"
              value="68.2"
              unit="%"
              limit="30% - 60%"
              trend="+2.1% / 1hr"
              status="WARNING"
            />
          </div>

          <div className="w-full overflow-hidden">
            <SensorTable />
          </div>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <AlertsPanel />
          <SystemIdentity />
        </div>
      </div>
    </PageShell>
  );
}
