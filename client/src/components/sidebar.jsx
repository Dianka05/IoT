import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  Activity, 
  Users, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Database, label: 'Equipment', path: '/device-details' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Activity, label: 'Logs', path: '/logs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col h-screen sticky top-0">
        <SidebarContent navItems={navItems} />
      </aside>

      <div
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100 flex-col z-50 p-0
          transform transition-transform duration-300 md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent navItems={navItems} />
      </aside>
    </>
  );
};

const SidebarContent = ({ navItems }) => {
  return (
    <>
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
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight uppercase">
              IoT Control
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Technician Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group
              ${isActive 
                ? 'bg-orange-50 text-orange-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
            `}
          >
            <div className="flex items-center gap-4">
              <span className="transition-transform duration-200 group-hover:scale-110">
                <item.icon size={22} />
              </span>
              <span className="font-bold text-sm tracking-wide leading-none">
                {item.label}
              </span>
            </div>
            <ChevronRight 
              size={16} 
              className={`transition-opacity duration-200 ${
                'opacity-0 group-hover:opacity-100 text-slate-400'
              }`} 
            />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 p-3 rounded-[24px] flex items-center gap-3 border border-slate-100">
          <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src="https://i.pravatar.cc/150?u=mickale" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-black text-slate-800 truncate">Mickale Jackson</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Technician</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;