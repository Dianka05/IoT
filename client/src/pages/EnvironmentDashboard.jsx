import { useState } from "react";
import Sidebar from '../components/sidebar';
import StatCard from '../components/EnvironmentDashboard/StatCard';
import AlertsPanel from '../components/EnvironmentDashboard/AlertsPanel';
import SensorTable from '../components/EnvironmentDashboard/SensorTable';
import SystemIdentity from '../components/EnvironmentDashboard/SystemIdentity';
import { Menu, RefreshCw, MapPin } from 'lucide-react';

const EnvironmentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header: Адаптивное выравнивание */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              {/* Бургер виден только на мобилках */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-95 transition-transform"
              >
                <Menu size={24} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                  Environment Dashboard
                </h1>
                <div className="flex items-center gap-1 text-slate-400 mt-1 uppercase text-[10px] font-bold tracking-widest">
                  <MapPin size={12} /> XZY SECTOR
                </div>
              </div>
            </div>
            
            <button className="
    flex items-center justify-center gap-2 
    bg-orange-500 hover:bg-orange-600 
    text-white font-bold text-[11px] md:text-sm 
    px-4 md:px-6 
    py-2.5 
    rounded-xl 
    transition-all shadow-lg shadow-orange-200 
    active:scale-95 
    shrink-0
  ">
              <RefreshCw size={16} className="md:w-[18px]" />
              <span>Force Sync</span>
            </button>
          </header>

          {/* Сетка: 1 колонка на мобилках, 12 на десктопе */}
          <div className="grid grid-cols-12 gap-5 md:gap-6">
            
            {/* Левая сторона: Статистика и Таблица */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <StatCard 
                  type="temp"
                  label="Internal Temperature" 
                  value="24.5" 
                  unit="°C" 
                  limit="15°C - 35°C" 
                  trend="-0.4°C / 1hr"
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
              
              {/* Обертка для таблицы для скролла на мобилках */}
              <div className="w-full overflow-hidden">
                 <SensorTable />
              </div>
            </div>

            {/* Правая сторона: Алерты и Система */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <AlertsPanel />
              <SystemIdentity />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnvironmentDashboard;