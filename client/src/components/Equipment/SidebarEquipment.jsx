import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor,
  Users,
  CreditCard,
  FileText, 
  Settings, 
  ChevronRight 
} from 'lucide-react';

const SidebarEquipment = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <aside className="
        hidden md:flex
        w-72 bg-white border-r border-slate-100 flex-col min-h-screen
      ">
        <SidebarContent />
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
        <SidebarContent />
      </aside>
    </>
  );
};

const SidebarContent = () => {
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
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
              IOT ACCESS
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavButton to="/admin-dashboard" icon={<LayoutDashboard size={22} />} label="Dashboard" />
        <NavButton to="/equipment" icon={<Monitor size={22} />} label="Equipment" />
        <NavButton to="/users" icon={<Users size={22} />} label="Users" />
        <NavButton to="/user-registry" icon={<Users size={22} />} label="User Registry" />
        <NavButton to="/rfid-auth" icon={<CreditCard size={22} />} label="RFID Auth" />
        <NavButton to="/logs" icon={<FileText size={22} />} label="Logs" />
        <NavButton to="/configuration" icon={<Settings size={22} />} label="Configuration" />
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-green-100 text-green-700 p-2 rounded-lg text-center text-xs font-medium">
          System Status: Active
        </div>
      </div>
    </>
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
        <span className="font-bold text-sm tracking-wide leading-none">
          {label}
        </span>
      </div>

      <ChevronRight 
        size={16} 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" 
      />
    </NavLink>
  );
};

export default SidebarEquipment;