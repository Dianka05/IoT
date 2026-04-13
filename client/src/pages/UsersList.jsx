import { useState } from "react";

import Sidebar from '../components/UsersList/Sidebar';
import UsersListHeader from '../components/UsersList/UsersListHeader';
import UserStatsCards from '../components/UsersList/UserStatsCards';
import UserTabs from '../components/UsersList/UserTabs';
import UserTable from '../components/UsersList/UserTable';

export default function UsersList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Users");

  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-hidden">

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto space-y-6">

          <UsersListHeader setSidebarOpen={setSidebarOpen} />
          <UserStatsCards />
          <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <UserTable activeTab={activeTab} />

        </div>
      </main>

    </div>
  );
}