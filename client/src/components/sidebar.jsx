import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  Monitor,
  Settings,
  Users,
} from 'lucide-react';
import { canManageUsers, canUseOperationsDashboard } from '../auth/roles';
import { useAuth } from '../auth/AuthContext';
import { formatRoleLabel } from '../utils/currentUser';

function getRoleLabel(role, loading) {
  if (loading && !role) return 'Loading';
  return formatRoleLabel(role);
}

function getNavItems(role) {
  if (!canUseOperationsDashboard(role)) {
    return [
      { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
      { to: '/equipment', icon: <Monitor size={22} />, label: 'My Equipment' },
      { to: '/sessions', icon: <Clock size={22} />, label: 'My Sessions' },
    ];
  }

  return [
    { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { to: '/equipment', icon: <Monitor size={22} />, label: 'Equipment' },
    { to: '/sessions', icon: <Clock size={22} />, label: 'Sessions' },
    ...(canManageUsers(role)
      ? [{ to: '/users', icon: <Users size={22} />, label: 'Users' }]
      : []),
    { to: '/rfid-auth', icon: <CreditCard size={22} />, label: 'RFID Auth' },
    { to: '/logs', icon: <FileText size={22} />, label: 'Logs' },
    { to: '/configuration', icon: <Settings size={22} />, label: 'Configuration' },
  ];
}

function NavButton({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center justify-between px-4 py-4 rounded-lg transition-all duration-200 group
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
}

function SidebarContent({
  role,
  userName,
  loading,
  organizations,
  currentOrganizationId,
  onSwitchOrganization,
  switchingOrganization,
}) {
  const roleLabel = getRoleLabel(role, loading);
  const navItems = getNavItems(role);
  const canCreateOrganization = role === 'admin';

  return (
    <div className="flex flex-col h-full">
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
              IoT Access
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {roleLabel} Portal
            </p>
          </div>
        </div>
      </div>

      {organizations.length > 0 && (
        <div className="px-4 pb-4">
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              <Building2 size={14} />
              Current Organization
            </div>

            <select
              value={currentOrganizationId || ''}
              onChange={(event) => onSwitchOrganization?.(event.target.value)}
              disabled={switchingOrganization}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {organizations.map((organization) => {
                const organizationId = organization.organizationId || organization.id;

                return (
                  <option key={organizationId} value={organizationId}>
                    {organization.name || organizationId}
                  </option>
                );
              })}
            </select>

            {canCreateOrganization && (
              <NavLink
                to="/create-organization"
                className="mt-3 inline-flex text-xs font-semibold text-orange-500 transition hover:text-orange-600"
              >
                Create organization
              </NavLink>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavButton key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 p-3 rounded-[24px] flex items-center gap-3 border border-slate-100">
          <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-orange-100 flex items-center justify-center text-sm font-black text-orange-600">
            {String(userName || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-black text-slate-800 truncate">
              {userName}
            </h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, setIsOpen, role: roleProp, userName: userNameProp }) {
  const navigate = useNavigate();
  const [switchingOrganization, setSwitchingOrganization] = useState(false);
  const {
    profile,
    role: authRole,
    loading,
    organizations,
    currentOrganizationId,
    setCurrentOrganization,
  } = useAuth();
  const role = roleProp || profile?.role || authRole || null;
  const userName = userNameProp || profile?.name || profile?.email || 'Loading';

  const handleSwitchOrganization = async (organizationId) => {
    if (!organizationId || organizationId === currentOrganizationId) {
      return;
    }

    setSwitchingOrganization(true);

    try {
      await setCurrentOrganization(organizationId);
      setIsOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch organization:', err);
      alert(err.message || 'Failed to switch organization');
    } finally {
      setSwitchingOrganization(false);
    }
  };

  return (
    <>
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col min-h-screen">
        <SidebarContent
          role={role}
          userName={userName}
          loading={loading}
          organizations={organizations}
          currentOrganizationId={currentOrganizationId}
          onSwitchOrganization={handleSwitchOrganization}
          switchingOrganization={switchingOrganization}
        />
      </aside>

      <div
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100 flex flex-col z-50 p-0
          transform transition-transform duration-300 md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent
          role={role}
          userName={userName}
          loading={loading}
          organizations={organizations}
          currentOrganizationId={currentOrganizationId}
          onSwitchOrganization={handleSwitchOrganization}
          switchingOrganization={switchingOrganization}
        />
      </aside>
    </>
  );
}
