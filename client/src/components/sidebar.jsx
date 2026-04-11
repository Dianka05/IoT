import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Settings, Database, Activity, Users } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Database, label: 'Equipment', path: '/device-details' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Activity, label: 'Logs', path: '/logs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {!isOpen && (
        <div className="md:hidden fixed top-6 left-6 z-[100]">
          <button 
            onClick={() => setIsOpen(true)} 
            className="p-3 bg-orange-500 text-white rounded-xl shadow-lg"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110] md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-[120]
        w-72 h-screen p-8 border-r border-slate-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 bg-orange-500' : '-translate-x-full md:translate-x-0 bg-orange-500 md:bg-white'}
      `}>
        
        <button 
          onClick={() => setIsOpen(false)} 
          className="md:hidden absolute top-6 right-6 text-white"
        >
          <X size={28} />
        </button>

        <div className="mb-12 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 md:bg-[#0f172a] rounded-lg flex items-center justify-center font-black text-white">
              I
            </div>
            <span className={`text-xl font-[1000] tracking-tighter uppercase 
              ${isOpen ? 'text-white' : 'text-white md:text-[#0f172a]'}`}>
              IoT Control
            </span>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-widest
                ${isOpen 
                  ? (isActive ? 'bg-white text-orange-600 shadow-md' : 'text-white/80 hover:bg-white/10') 
                  : (isActive ? 'md:bg-orange-500 md:text-white md:shadow-lg' : 'text-white/80 md:text-slate-400 md:hover:bg-slate-50')
                }
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`mt-10 pt-6 border-t shrink-0 ${isOpen ? 'border-white/20' : 'md:border-slate-100'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-[20px] ${isOpen ? 'bg-white/10' : 'md:bg-slate-50'}`}>
            <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-white md:border-slate-200 shadow-sm">
              <img src="https://i.pravatar.cc/150?u=mickale" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className={`text-sm font-black truncate ${isOpen ? 'text-white' : 'md:text-[#0f172a]'}`}>Mickale Jackson</h4>
              <p className={`text-[10px] font-bold uppercase ${isOpen ? 'text-white/60' : 'md:text-slate-400'}`}>Technician</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;