import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import SessionsStats from "../components/Sessions/SessionsStats";
import SessionsTable from "../components/Sessions/SessionsTable";
import SessionsPagination from "../components/Sessions/SessionsPagination";
import SessionReservationModal from "../components/Sessions/SessionReservationModal";
import { createSession, endSession, getSessions } from "../api/dashboard";
import { getBoxes, getDevices } from "../api/equipment";
import { canUseOperationsDashboard } from "../auth/roles";
import { useAuth } from "../auth/AuthContext";
import { getActiveCardUid } from "../utils/currentUser";
import { getDisplayStatus } from "../utils/equipmentStatus";
import { useToast } from "../toast/ToastProvider";

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

function mapSessionRow(session, nowMs, deviceNameMap) {
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
    sessionId: session.sessionId || session.id,
    userName: session.userName || session.userId || "Unknown User",
    userRole: formatRole(session.role),
    hardwareLabel:
      Array.isArray(session.deviceIds) && session.deviceIds.length > 0
        ? session.deviceIds.map((deviceId) => deviceNameMap.get(deviceId) || deviceId).join(", ")
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
  const toast = useToast();
  const { role, profile, loading: authLoading, currentOrganizationId } = useAuth();
  const isOperationsRole = canUseOperationsDashboard(role);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terminatingId, setTerminatingId] = useState("");
  const [submittingReservation, setSubmittingReservation] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
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
      const [items, boxesList, devicesList] = await Promise.all([
        getSessions(200),
        getBoxes(200),
        getDevices(200),
      ]);
      setSessions(items);
      setBoxes(boxesList);
      setDevices(devicesList);
      setPage(1);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    if (!authLoading) {
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
      toast.success("Session stopped", "The session was ended successfully.");
    } catch (err) {
      console.error("Failed to end session:", err);
      setError(err.message || "Failed to end session");
      toast.error("Stop failed", err.message || "The session could not be ended.");
    } finally {
      setTerminatingId("");
    }
  };

  const activeCardUid = useMemo(() => getActiveCardUid(profile), [profile]);
  const allowedDeviceIds = useMemo(
    () => new Set((profile?.allowedDeviceIds || []).map((value) => String(value))),
    [profile]
  );
  const boxStatusMap = useMemo(() => {
    const map = new Map();
    boxes.forEach((box) => {
      const boxId = String(box.boxId || box.id || "");
      if (boxId) {
        map.set(boxId, getDisplayStatus(box));
      }
    });
    return map;
  }, [boxes]);
  const reservableDevices = useMemo(
    () =>
      devices.filter((device) => {
        const deviceId = String(device.deviceId || device.id || "");
        const status = getDisplayStatus(device);
        const boxStatus = boxStatusMap.get(String(device.boxId || "")) || "";

        if (!deviceId || !allowedDeviceIds.has(deviceId)) {
          return false;
        }

        if (device.active === false) {
          return false;
        }

        if (boxStatus === "maintenance" || boxStatus === "offline") {
          return false;
        }

        return status !== "maintenance" && status !== "offline" && status !== "busy" && status !== "reserved" && status !== "in_use";
      }),
    [devices, allowedDeviceIds, boxStatusMap]
  );
  const reservableBoxIds = useMemo(
    () => new Set(reservableDevices.map((device) => String(device.boxId || "")).filter(Boolean)),
    [reservableDevices]
  );
  const reservableBoxes = useMemo(
    () => boxes.filter((box) => reservableBoxIds.has(String(box.boxId || box.id || ""))),
    [boxes, reservableBoxIds]
  );
  const deviceNameMap = useMemo(() => {
    const map = new Map();
    devices.forEach((device) => {
      const deviceId = device.deviceId || device.id;
      if (deviceId) {
        map.set(deviceId, device.name || deviceId);
      }
    });
    return map;
  }, [devices]);

  const handleCreateReservation = async (payload) => {
    setSubmittingReservation(true);
    setError("");

    try {
      await createSession(payload);
      setReservationModalOpen(false);
      await loadSessionsData();
      toast.success("Reservation created", "The device reservation is now waiting for RFID authentication at the box.");
    } catch (err) {
      console.error("Failed to create reservation:", err);
      setError(err.message || "Failed to create reservation");
      toast.error("Reservation failed", err.message || "The reservation could not be created.");
    } finally {
      setSubmittingReservation(false);
    }
  };

  const sessionsState = useMemo(
    () => sessions.map((session) => mapSessionRow(session, nowMs, deviceNameMap)),
    [sessions, nowMs, deviceNameMap]
  );
  const totalItems = sessionsState.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = sessionsState.slice(start, end);
  const liveSessions = sessionsState.filter(
    (session) => session.status === "ACTIVE" || session.status === "PENDING"
  ).length;
  const reservationDisabledReason = useMemo(() => {
    if (!activeCardUid) {
      return "You need at least one active RFID card before you can reserve equipment.";
    }

    if (allowedDeviceIds.size === 0) {
      return "No devices are assigned to your account yet. Ask an administrator to grant device access.";
    }

    if (reservableBoxes.length === 0) {
      return "No available boxes are ready right now. A box or device may be offline, in maintenance, reserved, or already in use.";
    }

    return "Choose a box first, then pick one or more available devices inside it.";
  }, [activeCardUid, allowedDeviceIds, reservableBoxes]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
    <PageShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <PageHeader
        title={isOperationsRole ? "Sessions" : "My Sessions"}
        subtitle={
          isOperationsRole
            ? "Monitor workspace sessions and create reservations with your own RFID card."
            : "Manage your own reservations and active hardware access sessions."
        }
        setSidebarOpen={setSidebarOpen}
        onRefresh={loadSessionsData}
        refreshing={loading && sessions.length > 0}
        action={(
          <button
            type="button"
            onClick={() => setReservationModalOpen(true)}
            disabled={!activeCardUid || reservableBoxes.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Create Reservation
          </button>
        )}
      />

      <div className="space-y-10">
        {error && (
          <StatusBanner tone="error">
            {error}
          </StatusBanner>
        )}

        {!activeCardUid && (
          <StatusBanner className="border-amber-200 bg-amber-50 text-amber-700">
            You need at least one active RFID card to create a reservation.
          </StatusBanner>
        )}

        <StatusBanner className="border-slate-200 bg-slate-50 text-slate-600">
          {reservationDisabledReason}
        </StatusBanner>

        {loading && (
          <StatusBanner>
            Loading sessions...
          </StatusBanner>
        )}

        <SessionsStats
          liveSessions={liveSessions}
          totalSessions={totalItems}
          isOperationsRole={isOperationsRole}
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
    <SessionReservationModal
      open={reservationModalOpen}
      boxes={reservableBoxes}
      devices={reservableDevices}
      defaultDurationSec={profile?.sessionDurationSec || 1800}
      activeCardUid={activeCardUid}
      submitting={submittingReservation}
      onClose={() => setReservationModalOpen(false)}
      onSubmit={handleCreateReservation}
    />
    </>
  );
}
