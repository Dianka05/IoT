import { useState } from "react";

import Sidebar from '../components/UsersList/Sidebar';
import UsersListHeader from '../components/UsersList/UsersListHeader';
import UserStatsCards from '../components/UsersList/UserStatsCards';
import UserTabs from '../components/UsersList/UserTabs';
import UserTable from '../components/UsersList/UserTable';
import Pagination from '../components/UsersList/Pagination';

export default function UserRegistry() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Users");

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-6 md:p-8">

        <UsersListHeader setSidebarOpen={setSidebarOpen} />
        <UserStatsCards />
        <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <UserTable activeTab={activeTab} />
        <Pagination />

      </main>

    </div>
  );
}
