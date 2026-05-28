import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import DeviceDetails from './pages/DeviceDetails';
import UsersList from './pages/UsersList';
import Logs from './pages/Logs';
import Equipment from './pages/Equipment';
import EnvironmentDashboard from './pages/EnvironmentDashboard';
import CreateOrganization from './pages/CreateOrganization';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Registration from './pages/Registration';
import Sessions from './pages/Sessions';
import RfidAuth from './pages/RfidAuth';
import Configuration from './pages/Configuration';
import LoadingScreen from './components/loadingScreen';
import { useAuth } from './auth/AuthContext';
import { getDefaultRouteForRole } from './auth/roles';
import { useToast } from './toast/ToastProvider';

const Maintenance = () => <div className="p-8">Maintenance Page (In Progress)</div>;
const Settings = () => <div className="p-8">Settings Page (In Progress)</div>;
function AccessRestricted() {
  const navigate = useNavigate();
  const toast = useToast();
  const [switchingOrganization, setSwitchingOrganization] = useState(false);
  const {
    profile,
    organizations,
    currentOrganizationId,
    setCurrentOrganization,
  } = useAuth();

  const memberships = Array.isArray(profile?.memberships) ? profile.memberships : [];
  const organizationItems = organizations.length > 0
    ? organizations
    : (Array.isArray(profile?.organizationIds) ? profile.organizationIds : []).map((organizationId) => ({
        organizationId,
        name: organizationId,
      }));
  const activeOrganizations = organizationItems.filter((organization) => {
    const organizationId = organization.organizationId || organization.id;
    const membership = memberships.find((item) => item.organizationId === organizationId);
    return membership?.active !== false;
  });

  const handleSwitchOrganization = async (organizationId) => {
    if (!organizationId || organizationId === currentOrganizationId) {
      return;
    }

    setSwitchingOrganization(true);

    try {
      await setCurrentOrganization(organizationId);
      toast.success("Organization switched", "You can continue working in the selected organization.");
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to switch organization from restricted access screen:', err);
      toast.error("Switch failed", err.message || "Could not switch to the selected organization.");
    } finally {
      setSwitchingOrganization(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
          Access Restricted
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Your access is currently limited
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your profile is inactive in the selected organization, so the dashboard and equipment tools are unavailable right now.
          {activeOrganizations.length > 0
            ? ' You can switch to another organization where your access is still active.'
            : ' Please contact an administrator if you need access restored.'}
        </p>

        {activeOrganizations.length > 0 && (
          <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Available Organizations
            </p>
            <div className="mt-4 space-y-3">
              {activeOrganizations.map((organization) => {
                const organizationId = organization.organizationId || organization.id;
                const isCurrent = organizationId === currentOrganizationId;

                return (
                  <button
                    key={organizationId}
                    type="button"
                    onClick={() => handleSwitchOrganization(organizationId)}
                    disabled={switchingOrganization || isCurrent}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {organization.name || organizationId}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {organizationId}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                      {isCurrent ? 'Current' : 'Switch'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeRoute() {
  const {
    role,
    loading,
    isAuthenticated,
    isProfileActive,
    needsOrganizationSetup,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfileActive) {
    return <Navigate to="/access-restricted" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (needsOrganizationSetup) {
    return <Navigate to="/create-organization" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(role)} replace />;
}

function PublicRoute({ children }) {
  const {
    loading,
    isAuthenticated,
    isProfileActive,
    needsOrganizationSetup,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          !isProfileActive
            ? '/access-restricted'
            : mustChangePassword
              ? '/change-password'
              : needsOrganizationSetup
                ? '/create-organization'
                : '/dashboard'
        }
        replace
      />
    );
  }

  return children;
}

function ProtectedRoute({ children }) {
  const {
    loading,
    isAuthenticated,
    isProfileActive,
    needsOrganizationSetup,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfileActive) {
    return <Navigate to="/access-restricted" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (needsOrganizationSetup) {
    return <Navigate to="/create-organization" replace />;
  }

  return children;
}

function CreateOrganizationRoute() {
  const {
    loading,
    isAuthenticated,
    isProfileActive,
    needsOrganizationSetup,
    hasOrganizations,
    canCreateOrganizations,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfileActive) {
    return <Navigate to="/access-restricted" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (!needsOrganizationSetup && hasOrganizations && !canCreateOrganizations) {
    return <Navigate to="/dashboard" replace />;
  }

  return <CreateOrganization />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/access-restricted" element={<AccessRestrictedRoute />} />
        <Route path="/environment-dashboard" element={<ProtectedRoute><EnvironmentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/device-details" element={<ProtectedRoute><DeviceDetails /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
        <Route path="/rfid-auth" element={<ProtectedRoute><RfidAuth /></ProtectedRoute>} />
        <Route path="/user-registry" element={<Navigate to="/users" replace />} />
        <Route path="/create-organization" element={<CreateOrganizationRoute />} />
        <Route path="/change-password" element={<ChangePasswordRoute />} />
        <Route path="*" element={<div className="p-10">404: Not Found</div>} />
        <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Registration /></PublicRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

function ChangePasswordRoute() {
  const { loading, isAuthenticated, isProfileActive, mustChangePassword, needsOrganizationSetup } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfileActive) {
    return <Navigate to="/access-restricted" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to={needsOrganizationSetup ? "/create-organization" : "/dashboard"} replace />;
  }

  return <ChangePassword />;
}

function AccessRestrictedRoute() {
  const { loading, isAuthenticated, isProfileActive } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isProfileActive) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AccessRestricted />;
}

export default App;
