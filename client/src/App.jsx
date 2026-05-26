import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const Maintenance = () => <div className="p-8">Maintenance Page (In Progress)</div>;
const Settings = () => <div className="p-8">Settings Page (In Progress)</div>;
const AccessRestricted = () => (
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
        Please contact an administrator if you need access restored.
      </p>
    </div>
  </div>
);

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
