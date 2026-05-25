import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import SessionsStats from "../components/Sessions/SessionsStats";
import SessionsTable from "../components/Sessions/SessionsTable";
import SessionsPagination from "../components/Sessions/SessionsPagination";
import { endSession, getSessions } from "../api/dashboard";
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

function formatDateTime(timestamp) {
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

function formatRole(value) {
  const role = String(value || "user").toLowerCase();
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function mapSessionRow(session, nowMs) {
  const status = String(session.status || "").toLowerCase();
  const durationSec = Number(session.sessionDurationSec || 0);
  const startedAtMs = toMillis(session.startedAt || session.createdAt);
  const elapsedSec = startedAtMs ? Math.max(0, Math.floor((nowMs - startedAtMs) / 1000)) : 0;
  const remainingSec = durationSec > 0 ? Math.max(0, durationSec - elapsedSec) : 0;
  const isLive = status === "active";
  const isPending = status === "pending";
  const durationMinutes = durationSec > 0 ? Math.max(1, Math.round(durationSec / 60)) : 0;
  const percent = durationSec > 0 ? Math.min(100, Math.round((elapsedSec / durationSec) * 100)) : 0;
  const mm = Math.floor(remainingSec / 60);
  const ss = remainingSec % 60;

  let time = "Not started";
  if (isLive) {
    time = `${mm}:${String(ss).padStart(2, "0")}`;
  } else if (isPending) {
    time = "Pending start";
  } else if (status === "ended") {
    time = session.endedAt ? "Completed" : "Ended";
  }

  return {
    id: session.sessionId || session.id,
    userName: session.userName || session.userId || "Unknown User",
    userRole: formatRole(session.role),
    hardwareLabel:
      Array.isArray(session.deviceIds) && session.deviceIds.length > 0
        ? session.deviceIds.join(", ")
        : "No devices",
    boxLabel: session.boxId || "No box",
    mode: String(session.mode || "manual").toUpperCase(),
    started: formatDateTime(session.startedAt || session.createdAt),
    status: isLive ? "ACTIVE" : isPending ? "PENDING" : "ENDED",
    time,
    percent,
    durationMinutes,
  };
}

export default function Sessions() {
  const { role, loading: authLoading, currentOrganizationId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terminatingId, setTerminatingId] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());

  const perPage = 6;

  const loadSessionsData = useCallback(async () => {
    if (!currentOrganizationId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const items = await getSessions(200);
      setSessions(items);
      setPage(1);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    if (!authLoading && canUseOperationsDashboard(role)) {
      loadSessionsData();
    }
  }, [authLoading, role, loadSessionsData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTerminate = async (id) => {
    setTerminatingId(id);
    setError("");

    try {
      await endSession(id, "manual");
      await loadSessionsData();
    } catch (err) {
      console.error("Failed to end session:", err);
      setError(err.message || "Failed to end session");
    } finally {
      setTerminatingId("");
    }
  };

  const sessionsState = useMemo(
    () => sessions.map((session) => mapSessionRow(session, nowMs)),
    [sessions, nowMs]
  );
  const totalItems = sessionsState.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = sessionsState.slice(start, end);
  const liveSessions = sessionsState.filter(
    (session) => session.status === "ACTIVE" || session.status === "PENDING"
  ).length;

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canUseOperationsDashboard(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return (
    <PageShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <PageHeader
        title="Sessions"
        subtitle="Monitor and manage all active hardware access sessions."
        setSidebarOpen={setSidebarOpen}
        onRefresh={loadSessionsData}
        refreshing={loading && sessions.length > 0}
      />

      <div className="space-y-10">
        {error && (
          <StatusBanner tone="error">
            {error}
          </StatusBanner>
        )}

        {loading && (
          <StatusBanner>
            Loading sessions...
          </StatusBanner>
        )}

        <SessionsStats
          liveSessions={liveSessions}
          totalSessions={totalItems}
        />

        <section>
          <SessionsTable
            data={pageData}
            onTerminate={terminatingId ? () => {} : handleTerminate}
          />

          <SessionsPagination
            totalItems={totalItems}
            perPage={perPage}
            page={page}
            setPage={setPage}
          />
        </section>
      </div>
    </PageShell>
  );
}
