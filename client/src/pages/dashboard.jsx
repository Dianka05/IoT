import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Ban,
  Box,
  Clock,
  Fingerprint,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';
import LoadingScreen from '../components/loadingScreen';
import PageHeader from '../components/pageHeader';
import PageShell from '../components/pageShell';
import StatusBanner from '../components/statusBanner';
import StatusBadge from '../components/dashboard/StatusBadge';
import SessionCard from '../components/dashboard/SessionCard';
import ActivityLog from '../components/dashboard/ActivityLog';
import StatCard from '../components/statCard';
import EquipmentTable from '../components/adminDashboard/EquipmentTable';
import LiveActivity from '../components/adminDashboard/LiveActivity';
import { getDevices } from '../api/equipment';
import { getAdminOverview, getSessions } from '../api/dashboard';
import { canManageUsers, canUseOperationsDashboard } from '../auth/roles';
import { useAuth } from '../auth/AuthContext';
import {
  formatRoleLabel,
  getCurrentUserCardBadge,
  getCurrentUserDisplayName,
  getCurrentUserSessions,
} from '../utils/currentUser';
import SurfaceCard from "../components/surfaceCard";

const ACTIVE_SESSION_STATUSES = new Set(['pending', 'active']);
const ALERT_TYPES = new Set(['auth_denied', 'mqtt_handler_error']);

const QuickActionBtn = ({ icon, label, to }) => {
  const Icon = icon;

  return (
    <SurfaceCard className="flex-1 p-6 hover:bg-slate-100 transition-all group shadow-sm hover:scale-99">
      <Link
        to={to}
        className="flex flex-col items-center justify-center gap-4"
      >
        <Icon size={24} className="text-slate-600" />

        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
          {label}
        </span>
      </Link>
    </SurfaceCard>
  );
};

function toMillis(timestamp) {
  if (!timestamp) return null;
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp._seconds === 'number') {
    return timestamp._seconds * 1000 + Math.floor((timestamp._nanoseconds || 0) / 1000000);
  }
  return null;
}

function formatClock(timestamp) {
  const millis = toMillis(timestamp);
  if (!millis) return 'now';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(millis));
}

function formatRelativeTime(timestamp) {
  const millis = toMillis(timestamp);
  if (!millis) return 'now';

  const diffSec = Math.max(0, Math.floor((Date.now() - millis) / 1000));
  if (diffSec < 60) return `${diffSec}s`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;

  return `${Math.floor(diffHours / 24)}d`;
}

function getDeviceNameMap(devices) {
  const map = new Map();

  devices.forEach((device) => {
    if (device.id) map.set(device.id, device.name || device.id);
    if (device.deviceId) map.set(device.deviceId, device.name || device.deviceId);
  });

  return map;
}

function buildActivityItems(sessions, deviceNameMap) {
  return sessions.slice(0, 8).map((session) => {
    const status = String(session.status || '').toLowerCase();
    const deviceNames = (session.deviceIds || []).map((id) => deviceNameMap.get(id) || id).join(', ');
    const desc = deviceNames || session.boxId || 'No equipment';

    if (status === 'active') {
      return {
        id: session.id,
        icon: <LogIn className="text-green-600" />,
        title: 'Session active',
        desc,
        time: formatClock(session.startedAt || session.createdAt),
        bg: 'bg-green-50',
      };
    }

    if (status === 'pending') {
      return {
        id: session.id,
        icon: <Ban className="text-orange-500" />,
        title: 'Reservation pending',
        desc,
        time: formatClock(session.createdAt),
        bg: 'bg-orange-50',
      };
    }

    return {
      id: session.id,
      icon: <LogOut className="text-slate-500" />,
      title: 'Session ended',
      desc,
      time: formatClock(session.endedAt || session.updatedAt || session.createdAt),
      bg: 'bg-slate-50',
    };
  });
}

function buildDeviceRows(devices, sessions) {
  const activeSessionByDevice = new Map();

  sessions.forEach((session) => {
    const status = String(session.status || '').toLowerCase();
    if (!ACTIVE_SESSION_STATUSES.has(status)) return;

    const ids = Array.isArray(session.deviceIds) ? session.deviceIds : [];
    ids.forEach((deviceId) => {
      activeSessionByDevice.set(deviceId, session);
    });
  });

  return devices.map((device) => {
    const deviceId = device.deviceId || device.id;
    const activeSession = activeSessionByDevice.get(deviceId);
    const rawStatus = String(device.status || '').toLowerCase();

    let status = 'IDLE';
    if (activeSession) {
      status = 'IN USE';
    } else if (device.active === false || rawStatus === 'offline') {
      status = 'OFFLINE';
    } else if (rawStatus === 'active' || rawStatus === 'online') {
      status = 'ACTIVE';
    }

    let progress = 0;
    const startedAt = toMillis(activeSession?.startedAt);
    const durationSec = Number(activeSession?.sessionDurationSec || 0);

    if (startedAt && durationSec > 0) {
      const elapsedSec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      progress = Math.min(100, Math.round((elapsedSec / durationSec) * 100));
    }

    return {
      id: device.id || deviceId,
      name: device.name || deviceId || 'Unnamed device',
      loc: device.boxId || device.location || 'Unassigned',
      status,
      progress,
    };
  });
}

function buildLiveActivity(logs) {
  return logs.slice(0, 8).map((log) => {
    let description = log.message || 'System event received';

    if (log.userId || log.uid || log.boxId) {
      const parts = [];
      if (log.userId) parts.push(`User ${log.userId}`);
      if (log.uid) parts.push(`RFID ${log.uid}`);
      if (log.boxId) parts.push(`at ${log.boxId}`);
      description = parts.join(' ');
    }

    return {
      id: log.id,
      type: log.type,
      time: formatRelativeTime(log.createdAt),
      description,
    };
  });
}

function buildCurrentUserCardData(profile, role, activeSession, deviceNameMap, workspaceLabel) {
  const cardBadge = getCurrentUserCardBadge(profile);
  const roleLabel = formatRoleLabel(role);
  const displayName = getCurrentUserDisplayName(profile);

  if (!activeSession) {
    return {
      title: displayName,
      subtitle: `${roleLabel} | ${workspaceLabel}`,
      rfid: cardBadge.label,
      rfidTone: cardBadge.tone,
      initialSecondsLeft: 0,
      showTimer: false,
    };
  }

  const deviceNames = (activeSession.deviceIds || [])
    .map((id) => deviceNameMap.get(id) || id)
    .join(', ');

  const durationSec = Number(activeSession.sessionDurationSec || 0);
  const startedAt = toMillis(activeSession.startedAt);
  let secondsLeft = durationSec;

  if (startedAt && durationSec > 0) {
    const elapsedSec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    secondsLeft = Math.max(0, durationSec - elapsedSec);
  }

  return {
    title: displayName,
    subtitle: `${roleLabel} | ${deviceNames || activeSession.boxId || workspaceLabel}`,
    rfid: cardBadge.label,
    rfidTone: cardBadge.tone,
    initialSecondsLeft: secondsLeft,
    showTimer: secondsLeft > 0,
  };
}

const Dashboard = () => {
  const {
    profile,
    role,
    loading: authLoading,
    currentOrganizationId,
    currentOrganization,
  } = useAuth();
  const isOperationsRole = canUseOperationsDashboard(role);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState({
    users: [],
    devices: [],
    sessions: [],
    logs: [],
    boxes: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (authLoading || !currentOrganizationId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      if (isOperationsRole) {
        const adminOverview = await getAdminOverview();
        setOverview(adminOverview);
      } else {
        const [devicesList, sessionsList] = await Promise.all([
          getDevices(100),
          getSessions(100),
        ]);

        setDevices(devicesList);
        setSessions(sessionsList);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, currentOrganizationId, isOperationsRole]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboardDevices = isOperationsRole ? overview.devices : devices;
  const dashboardSessions = isOperationsRole ? overview.sessions : sessions;
  const deviceNameMap = useMemo(() => getDeviceNameMap(dashboardDevices), [dashboardDevices]);

  const currentUserSessions = useMemo(
    () => getCurrentUserSessions(dashboardSessions, profile),
    [dashboardSessions, profile]
  );

  const currentUserActiveSession = useMemo(
    () => currentUserSessions.find((session) =>
      ACTIVE_SESSION_STATUSES.has(String(session.status || '').toLowerCase())
    ) || null,
    [currentUserSessions]
  );

  const currentUserCardData = useMemo(
    () => buildCurrentUserCardData(
      profile,
      role,
      currentUserActiveSession,
      deviceNameMap,
      currentOrganization?.name ||
        currentOrganizationId ||
        (isOperationsRole ? 'Operations workspace' : 'Personal workspace')
    ),
    [
      profile,
      role,
      currentUserActiveSession,
      deviceNameMap,
      currentOrganization,
      currentOrganizationId,
      isOperationsRole,
    ]
  );

  const activityItems = useMemo(
    () => buildActivityItems(currentUserSessions, deviceNameMap),
    [currentUserSessions, deviceNameMap]
  );

  const stats = useMemo(() => {
    const activeSessions = overview.sessions.filter((session) =>
      ACTIVE_SESSION_STATUSES.has(String(session.status || '').toLowerCase())
    ).length;

    const activeUsers = overview.users.filter((user) => user.active === true).length;

    const onlineDevices = overview.devices.filter((device) => {
      if (device.active === false) return false;
      const status = String(device.status || '').toLowerCase();
      return status === 'active' || status === 'online' || status === 'idle' || status === 'ready';
    }).length;

    const alerts = overview.logs.filter((log) =>
      ALERT_TYPES.has(String(log.type || '').toLowerCase())
    ).length;

    return {
      activeSessions,
      activeUsers,
      onlineDevices,
      alerts,
    };
  }, [overview]);

  const deviceRows = useMemo(
    () => buildDeviceRows(overview.devices, overview.sessions),
    [overview.devices, overview.sessions]
  );

  const liveActivity = useMemo(
    () => buildLiveActivity(overview.logs),
    [overview.logs]
  );

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (isOperationsRole) {
    return (
      <PageShell
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarProps={{
          role,
          userName: profile?.name || profile?.email || 'Current User',
        }}
      >
            <PageHeader
              title="System Overview"
              setSidebarOpen={setSidebarOpen}
              subtitle={
                role === 'technician'
                  ? 'Operations overview for technician workflows'
                  : 'Operations overview with full administrative control'
              }
              onRefresh={() => loadDashboard(true)}
              refreshing={refreshing}
              className="mb-10"
            />

            <div className="mb-6">
              <SessionCard {...currentUserCardData} />
            </div>

            {error && (
              <StatusBanner tone="error" className="mb-6">
                {error}
              </StatusBanner>
            )}

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 xl:col-span-8 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    icon={Activity}
                    label="Active Sessions"
                    value={loading ? '...' : stats.activeSessions}
                    status="Live"
                    iconBg="bg-orange-50"
                  />
                  <StatCard
                    icon={Users}
                    label="Registered Users"
                    value={loading ? '...' : overview.users.length}
                    status={loading ? '...' : `${stats.activeUsers} active`}
                    iconBg="bg-blue-50"
                  />
                  <StatCard
                    icon={Box}
                    label="Equipment Units"
                    value={loading ? '...' : overview.devices.length}
                    trend={loading ? '...' : `${stats.onlineDevices} online`}
                    iconBg="bg-green-50"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    label="Security Alerts"
                    value={loading ? '...' : stats.alerts}
                    trend={stats.alerts > 0 ? 'Attention' : 'Clear'}
                    iconBg="bg-red-50"
                  />
                </div>

                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.15em]">
                      Quick Management Actions
                    </h3>
                  </div>
                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    {canManageUsers(role) ? (
                      <>
                        <QuickActionBtn icon={UserPlus} label="Add User" to="/users" />
                        <QuickActionBtn icon={Fingerprint} label="Assign RFID" to="/users" />
                        <QuickActionBtn icon={ShieldCheck} label="Security Logs" to="/logs" />
                      </>
                    ) : (
                      <>
                        <QuickActionBtn icon={Clock} label="Manage Sessions" to="/sessions" />
                        <QuickActionBtn icon={Wrench} label="Equipment Status" to="/equipment" />
                        <QuickActionBtn icon={ShieldCheck} label="Security Logs" to="/logs" />
                      </>
                    )}
                  </div>
                </section>

                <section>
                  <EquipmentTable devices={deviceRows} loading={loading} />
                </section>
              </div>

              <div className="col-span-12 xl:col-span-4">
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.15em]">
                    Live Activity Log
                  </h3>
                </div>
                <LiveActivity items={liveActivity} />
              </div>
            </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      shellClassName="flex min-h-screen bg-[#f8fafc]"
      mainClassName="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10"
    >
          <PageHeader
            title="System Overview"
            subtitle={`${profile?.name || profile?.email || 'User access'} | personal workspace`}
            setSidebarOpen={setSidebarOpen}
            className="mb-10"
            action={(
              <div className="w-fit">
                <StatusBadge
                  isOnline={!!currentUserActiveSession || dashboardDevices.length > 0}
                />
              </div>
            )}
          />

          {error && (
            <StatusBanner tone="error" className="mb-6">
              {error}
            </StatusBanner>
          )}

          <div className="max-w-5xl space-y-6 md:space-y-8">
            <SessionCard {...currentUserCardData} />
            <ActivityLog items={activityItems} />
          </div>
    </PageShell>
  );
};

export default Dashboard;
