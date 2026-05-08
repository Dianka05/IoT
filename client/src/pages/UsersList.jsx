import { useEffect, useState } from "react";

import Sidebar from '../components/AdminSidebar';
import UsersListHeader from '../components/UsersList/UsersListHeader';
import UserStatsCards from '../components/UsersList/UserStatsCards';
import UserTabs from '../components/UsersList/UserTabs';
import UserTable from '../components/UsersList/UserTable';

import {
  getUsers,
  getDevices,
  deleteUser,
} from '../api/users';

export default function UsersList() {
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
    loadData();
  }, []);

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

  return (
    <div className="flex min-h-screen h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <UsersListHeader
            setSidebarOpen={setSidebarOpen}
            onRefresh={handleRefresh}
            refreshing={refreshing}
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
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <UserTable
            activeTab={activeTab}
            users={users}
            devices={devices}
            loading={loading}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </main>
    </div>
  );
}