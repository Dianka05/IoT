import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import LoadingScreen from '../components/loadingScreen';
import PageHeader from '../components/pageHeader';
import PageShell from '../components/pageShell';
import StatusBanner from '../components/statusBanner';
import UserStatsCards from '../components/UsersList/UserStatsCards';
import UserTabs from '../components/UsersList/UserTabs';
import UserTable from '../components/UsersList/UserTable';

import {
  getUsers,
  getDevices,
  deleteUser,
} from '../api/users';
import { canManageUsers, getDefaultRouteForRole } from "../auth/roles";
import { useAuth } from "../auth/AuthContext";

export default function UsersList() {
  const { role, loading: authLoading, currentOrganizationId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Users");

  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");

    try {
      const [usersList, devicesList] = await Promise.all([
        getUsers(100),
        getDevices(100),
      ]);

      setUsers(usersList);
      setDevices(devicesList);
    } catch (err) {
      console.error("Failed to load users page:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentOrganizationId && canManageUsers(role)) {
      setLoading(true);
      loadData();
    }
  }, [authLoading, currentOrganizationId, role]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleDeleteUser = async (uid) => {
    await deleteUser(uid);

    setUsers((prev) =>
      prev.filter((user) => {
        const userId = user.id || user.userId || user.authUid;
        return userId !== uid;
      })
    );
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canManageUsers(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      mainClassName="flex-1 overflow-x-hidden p-4 md:p-8"
      contentClassName="max-w-[1400px] mx-auto space-y-6"
    >
          <PageHeader
            title="System Users"
            subtitle="Manage and control access for all registered system users."
            setSidebarOpen={setSidebarOpen}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            action={(
              <button
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
              >
                <UserPlus size={20} />
                Add New User
              </button>
            )}
          />

          <UserStatsCards
            users={users}
            devices={devices}
          />

          <UserTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {error && (
            <StatusBanner tone="error">
              {error}
            </StatusBanner>
          )}

          <UserTable
            activeTab={activeTab}
            users={users}
            devices={devices}
            loading={loading}
            onDeleteUser={handleDeleteUser}
          />
    </PageShell>
  );
}
