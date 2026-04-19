import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import AdminDashboard from './pages/adminDashboard';
import DeviceDetails from './pages/DeviceDetails';
import UsersList from './pages/UsersList';
import Logs from './pages/Logs';
import Equipment from './pages/Equipment';
import EnvironmentDashboard from './pages/EnvironmentDashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Registration from './pages/Registration';

const Maintenance = () => <div className="p-8">Maintenance Page (In Progress)</div>;
const Settings = () => <div className="p-8">Settings Page (In Progress)</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/environment-dashboard" element={<EnvironmentDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/device-details" element={<DeviceDetails />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div className="p-10">404: Not Found</div>} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </Router>
  );
}

export default App;