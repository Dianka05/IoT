import { useState, useEffect, useCallback } from "react";
import axios from "axios"; 
import AdminSidebar from "../components/AdminSidebar";
import SessionsHeader from "../components/Sessions/SessionsHeader";
import SessionsStats from "../components/Sessions/SessionsStats";
import SessionsTable from "../components/Sessions/SessionsTable";
import SessionsPagination from "../components/Sessions/SessionsPagination";

const formatDate = (ts) => {
  if (!ts) return "—";
  const date = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
  return date.toLocaleString();
};

export default function Sessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionsState, setSessionsState] = useState([]);
  
  const perPage = 6;
  const [page, setPage] = useState(1);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/sessions?limit=100");
      
      if (response.data.success) {
        const mapped = response.data.items.map(s => {
          const isStarted = !!s.startedAt;
          let timeDisplay = "Pending";
          let remainingSeconds = 0;
          let totalSeconds = s.sessionDurationSec || 1800;

          if (s.status === "active" && s.startedAt) {
            const startMs = s.startedAt._seconds * 1000;
            const elapsedMs = Date.now() - startMs;
            const elapsedSec = Math.floor(elapsedMs / 1000);
            remainingSeconds = Math.max(0, totalSeconds - elapsedSec);
            
            const mm = Math.floor(remainingSeconds / 60);
            const ss = remainingSeconds % 60;
            timeDisplay = `${mm}:${ss.toString().padStart(2, "0")}`;
          } else if (s.status === "ended") {
            timeDisplay = "Completed";
          }

          return {
            id: s.sessionId,
            user: `${s.userName} (${s.role.toUpperCase()})`,
            hardware: `${s.deviceIds.join(", ")} ${s.boxId}`,
            mode: s.mode.toUpperCase(),
            started: formatDate(s.startedAt || s.createdAt),
            status: s.status.toUpperCase(),
            time: timeDisplay,
            remainingSeconds,
            totalSeconds,
            percent: s.status === "active" ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100) : 0,
            durationMinutes: Math.round(totalSeconds / 60)
          };
        });
        setSessionsState(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionsState(prev =>
        prev.map(s => {
          if (s.status !== "ACTIVE" || s.remainingSeconds <= 0) return s;

          const newRemaining = s.remainingSeconds - 1;
          if (newRemaining <= 0) {
            return { ...s, status: "ENDED", time: "Completed", percent: 100 };
          }

          const mm = Math.floor(newRemaining / 60);
          const ss = newRemaining % 60;

          return {
            ...s,
            remainingSeconds: newRemaining,
            percent: Math.round(((s.totalSeconds - newRemaining) / s.totalSeconds) * 100),
            time: `${mm}:${ss.toString().padStart(2, "0")}`
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminate = async (sessionId) => {
    try {
      const response = await axios.post(`http://localhost:3000/sessions/${sessionId}/end`);
      if (response.data.success) {
        setSessionsState(prev => prev.map(s => 
          s.id === sessionId 
            ? { ...s, status: "ENDED", time: "Force Terminated" } 
            : s
        ));
      }
    } catch (error) {
      alert("Error terminating session: " + error.message);
    }
  };

  const totalItems = sessionsState.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = sessionsState.slice(start, end);

  return (
    <div className="flex min-h-screen h-screen bg-[#f8fafc] overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          <SessionsHeader setSidebarOpen={setSidebarOpen} onRefresh={fetchSessions} />

          <div className="space-y-10">
            <SessionsStats 
              activeCount={sessionsState.filter(s => s.status === "ACTIVE").length} 
            />

            <section className={loading ? "opacity-50 pointer-events-none" : ""}>
              <SessionsTable
                data={pageData}
                onTerminate={handleTerminate}
              />

              <SessionsPagination
                totalItems={totalItems}
                perPage={perPage}
                page={page}
                setPage={setPage}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}