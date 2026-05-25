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
import LoadingScreen from './components/loadingScreen';
import { useAuth } from './auth/AuthContext';
import { getDefaultRouteForRole } from './auth/roles';

const Maintenance = () => <div className="p-8">Maintenance Page (In Progress)</div>;
const Settings = () => <div className="p-8">Settings Page (In Progress)</div>;

function HomeRoute() {
  const {
    role,
    loading,
    isAuthenticated,
    needsOrganizationSetup,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
    needsOrganizationSetup,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={mustChangePassword ? '/change-password' : needsOrganizationSetup ? '/create-organization' : '/dashboard'}
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
    needsOrganizationSetup,
    mustChangePassword,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
        <Route path="/environment-dashboard" element={<ProtectedRoute><EnvironmentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/device-details" element={<ProtectedRoute><DeviceDetails /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/configuration" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
  const { loading, isAuthenticated, mustChangePassword, needsOrganizationSetup } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to={needsOrganizationSetup ? "/create-organization" : "/dashboard"} replace />;
  }

  return <ChangePassword />;
}

export default App;
