import { useState } from "react";

import Sidebar from "../components/Logs/Sidebar";
import Header from "../components/Logs/Header";
import Filters from "../components/Logs/Filters";
import LogsTable, { logsData } from "../components/Logs/LogsTable";
import Pagination from "../components/Logs/Pagination";
import FooterStats from "../components/Logs/FooterStats";

export default function Logs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filteredData, setFilteredData] = useState(logsData);
  const [page, setPage] = useState(1);

  const perPage = 6;

  const handleFilter = (filters) => {
    const result = logsData.filter((log) => {
      const logDate = log.timestamp.slice(0, 10);

      return (
        (filters.eventType === "" || log.eventType === filters.eventType) &&
        (filters.user === "" || log.user.toLowerCase().includes(filters.user.toLowerCase())) &&
        (filters.equipment === "" || log.equipment.toLowerCase().includes(filters.equipment.toLowerCase())) &&
        (filters.dateFrom === "" || logDate >= filters.dateFrom) &&
        (filters.dateTo === "" || logDate <= filters.dateTo)
      );
    });

    setFilteredData(result);
    setPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setFilteredData(logsData);
    setPage(1);
  };

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = filteredData.slice(start, end);

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">

        <Header setSidebarOpen={setSidebarOpen} onRefresh={handleRefresh} />

        <div key={refreshKey}>
          <Filters onFilter={handleFilter} onRefresh={handleRefresh} />
          <LogsTable data={pageData} />
        </div>

        <Pagination
          totalItems={filteredData.length}
          perPage={perPage}
          page={page}
          setPage={setPage}
        />

        <FooterStats
          stats={{
            successful: 1248,
            alerts: 14,
            warnings: 32,
            hours: 8760,
          }}
        />

      </main>
    </div>
  );
}
