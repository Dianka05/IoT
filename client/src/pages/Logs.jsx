import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import Filters from "../components/Logs/Filters";
import LogsTable from "../components/Logs/LogsTable";
import Pagination from "../components/Logs/Pagination";
import FooterStats from "../components/Logs/FooterStats";
import { getLogs } from "../api/dashboard";
import { canUseOperationsDashboard, getDefaultRouteForRole } from "../auth/roles";
import { useAuth } from "../auth/AuthContext";

function toMillis(timestamp) {
  if (!timestamp) return null;
  if (typeof timestamp === "number") return timestamp;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp?._seconds === "number") {
    return timestamp._seconds * 1000 + Math.floor((timestamp._nanoseconds || 0) / 1000000);
  }
  return null;
}

function formatTimestamp(timestamp) {
  const millis = toMillis(timestamp);
  if (!millis) return "Unknown";

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(millis)).replace(",", "");
}

function startCase(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toFilterDate(value) {
  const [day, month, year] = String(value || "").slice(0, 10).split("/");
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

function mapLogStatus(log) {
  const level = String(log.level || "").toLowerCase();
  const type = String(log.type || "").toLowerCase();

  if (level === "error" || type.includes("denied") || type.includes("error")) {
    return "FAILED";
  }

  if (level === "warning") {
    return "WARNING";
  }

  return "SUCCESS";
}

function mapLogItem(log) {
  const payload = log.payload || {};
  const eventPayload = payload.event || {};
  const sessionPayload = payload.session || {};
  const endedBy = payload.endedBy || {};
  const rfidUid =
    payload.uid ||
    sessionPayload.uid ||
    eventPayload.uid ||
    log.uid ||
    "";
  const sessionId =
    log.sessionId ||
    payload.sessionId ||
    eventPayload.sessionId ||
    sessionPayload.sessionId ||
    "";
  const boxId =
    payload.boxId ||
    sessionPayload.boxId ||
    eventPayload.boxId ||
    log.boxId ||
    "System";
  const user =
    log.userName ||
    sessionPayload.userName ||
    endedBy.name ||
    log.userId ||
    payload.uid ||
    log.uid ||
    "System";

  return {
    id: log.id,
    timestamp: formatTimestamp(log.createdAt || log.updatedAt),
    eventType: startCase(log.type || log.level || "system_event"),
    user,
    rfidUid,
    equipment: boxId,
    action: log.message || startCase(payload.type || "system activity"),
    status: mapLogStatus(log),
    sessionId,
  };
}

export default function Logs() {
  const { role, loading: authLoading, currentOrganizationId } = useAuth();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [logs, setLogs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const perPage = 6;
  const searchSessionId = searchParams.get("sessionId") || "";

  const loadLogsData = useCallback(async () => {
    if (!currentOrganizationId) {
      setLogs([]);
      setFilteredData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const items = await getLogs(200);
      const mapped = items.map(mapLogItem);
      const scoped = searchSessionId
        ? mapped.filter((item) => item.sessionId === searchSessionId)
        : mapped;
      setLogs(mapped);
      setFilteredData(scoped);
      setPage(1);
    } catch (err) {
      console.error("Failed to load logs:", err);
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [currentOrganizationId, searchSessionId]);

  useEffect(() => {
    if (!authLoading && canUseOperationsDashboard(role)) {
      loadLogsData();
    }
  }, [authLoading, role, loadLogsData]);

  const handleFilter = (filters) => {
    const result = logs.filter((log) => {
      const logDate = toFilterDate(log.timestamp);
      const sessionMatches =
        searchSessionId === "" || log.sessionId === searchSessionId;

      return (
        sessionMatches &&
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

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await loadLogsData();
  };

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = filteredData.slice(start, end);
  const eventTypeOptions = useMemo(
    () => [...new Set(logs.map((log) => log.eventType).filter(Boolean))].sort(),
    [logs]
  );
  const stats = useMemo(() => {
    const successful = logs.filter((log) => log.status === "SUCCESS").length;
    const alerts = logs.filter((log) => log.status === "FAILED").length;
    const warnings = logs.filter((log) => log.status === "WARNING").length;

    return {
      successful,
      alerts,
      warnings,
      hours: logs.length,
    };
  }, [logs]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canUseOperationsDashboard(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      mainClassName="flex-1 overflow-y-auto p-6 md:p-8"
    >
      <PageHeader
        title="System Security Logs"
        subtitle="Real-time monitoring of IoT equipment activities and access attempts."
        setSidebarOpen={setSidebarOpen}
        onRefresh={handleRefresh}
        refreshing={loading && logs.length > 0}
      />

      {error && (
        <StatusBanner tone="error" className="mb-6">
          {error}
        </StatusBanner>
      )}

      {searchSessionId && (
        <StatusBanner className="mb-6 border-orange-200 bg-orange-50 text-orange-700">
          Showing logs for session <span className="font-semibold">{searchSessionId}</span>.
        </StatusBanner>
      )}

      {loading && (
        <StatusBanner className="mb-6">
          Loading logs...
        </StatusBanner>
      )}

      <div key={refreshKey}>
        <Filters
          onFilter={handleFilter}
          onRefresh={handleRefresh}
          eventTypeOptions={eventTypeOptions}
        />
        <LogsTable data={pageData} />
      </div>

      <Pagination
        totalItems={filteredData.length}
        perPage={perPage}
        page={page}
        setPage={setPage}
      />

      <FooterStats stats={stats} />
    </PageShell>
  );
}
