import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  Settings, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col min-h-screen">
      
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-200">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 border-2 border-white rounded-full"></div>
              <div className="w-2 h-2 border-2 border-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
              IOT ACCESS
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Technician Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavButton 
          to="/dashboard" 
          icon={<LayoutDashboard size={22} />} 
          label="Dashboard" 
        />
        <NavButton 
          to="/maintenance" 
          icon={<Wrench size={22} />} 
          label="Maintenance" 
        />
        <NavButton 
          to="/logs" 
          icon={<FileText size={22} />} 
          label="Logs" 
        />
        <NavButton 
          to="/settings" 
          icon={<Settings size={22} />} 
          label="Settings" 
        />
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3 border border-slate-100">
          <div className="relative">
            <img 
              src="https://ui-avatars.com/api/?name=Mickale+Jackson&background=0f172a&color=fff" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Mickale Jackson</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Technician</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavButton = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group
        ${isActive 
          ? 'bg-orange-50 text-orange-600 shadow-sm' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
      `}
    >
      <div className="flex items-center gap-4">
        <span className="transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
        <span className="font-bold text-sm tracking-wide">{label}</span>
      </div>
      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );
};

export default Sidebar;