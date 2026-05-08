import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import DeviceDetails from './pages/DeviceDetails';
import UsersList from './pages/UsersList';
import Logs from './pages/Logs';
import Equipment from './pages/Equipment';
import EnvironmentDashboard from './pages/EnvironmentDashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Registration from './pages/Registration';
import Sessions from './pages/Sessions';
import LoadingScreen from './components/loadingScreen';
import { useAuth } from './auth/AuthContext';
import { getDefaultRouteForRole } from './auth/roles';

const Maintenance = () => <div className="p-8">Maintenance Page (In Progress)</div>;
const Settings = () => <div className="p-8">Settings Page (In Progress)</div>;

function HomeRoute() {
  const { role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Navigate to={getDefaultRouteForRole(role)} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/environment-dashboard" element={<EnvironmentDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/device-details" element={<DeviceDetails />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/configuration" element={<Settings />} />
        <Route path="/rfid-auth" element={<Maintenance />} />
        <Route path="/user-registry" element={<Navigate to="/users" replace />} />
        <Route path="*" element={<div className="p-10">404: Not Found</div>} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/sessions" element={<Sessions />} />
      </Routes>
    </Router>
  );
}

export default App;
