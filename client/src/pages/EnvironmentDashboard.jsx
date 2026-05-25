import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { Box, MapPin } from "lucide-react";
import AlertsPanel from "../components/EnvironmentDashboard/AlertsPanel";
import SensorTable from "../components/EnvironmentDashboard/SensorTable";
import StatCard from "../components/EnvironmentDashboard/StatCard";
import SystemIdentity from "../components/EnvironmentDashboard/SystemIdentity";
import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import SurfaceCard from "../components/surfaceCard";
import { getActivities } from "../api/activities";
import { getBoxes, getDevices } from "../api/equipment";
import { useAuth } from "../auth/AuthContext";
import { canUseOperationsDashboard, getDefaultRouteForRole } from "../auth/roles";

function getDeviceId(device) {
  return device?.deviceId || device?.id || "";
}

function getBoxId(box) {
  return box?.boxId || box?.id || "";
}

function toMillis(timestamp) {
  if (!timestamp) return null;
  if (typeof timestamp === "number") return timestamp;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp?._seconds === "number") {
    return timestamp._seconds * 1000 + Math.floor((timestamp._nanoseconds || 0) / 1000000);
  }
  return null;
}

function formatRelativeTime(timestamp) {
  const millis = toMillis(timestamp);
  if (!millis) return "just now";

  const diffSec = Math.max(0, Math.floor((Date.now() - millis) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
}

function startCaseLabel(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function flattenPayload(value, prefix = "") {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenPayload(item, prefix ? `${prefix}.${index + 1}` : String(index + 1))
    );
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenPayload(child, prefix ? `${prefix}.${key}` : key)
    );
  }

  return [{ path: prefix, value }];
}

function inferMetricStatus(path, value) {
  const lowerPath = String(path || "").toLowerCase();

  if (typeof value === "number") {
    if (lowerPath.includes("temp")) {
      return value < 15 || value > 35 ? "warning" : "normal";
    }

    if (lowerPath.includes("humid")) {
      return value < 30 || value > 60 ? "warning" : "normal";
    }

    return "normal";
  }

  if (typeof value === "boolean") {
    return value ? "normal" : "error";
  }

  const stringValue = String(value || "").toLowerCase();

  if (
    stringValue.includes("error") ||
    stringValue.includes("fault") ||
    stringValue.includes("fail") ||
    stringValue.includes("offline") ||
    stringValue.includes("disconnected")
  ) {
    return "error";
  }

  if (
    stringValue.includes("warning") ||
    stringValue.includes("degraded") ||
    stringValue.includes("high") ||
    stringValue.includes("low")
  ) {
    return "warning";
  }

  return "normal";
}

function formatMetricValue(path, value) {
  if (typeof value === "number") {
    const lowerPath = String(path || "").toLowerCase();

    if (lowerPath.includes("temp")) {
      return `${value.toFixed(1)} C`;
    }

    if (lowerPath.includes("humid") || lowerPath.includes("percent")) {
      return `${value.toFixed(1)} %`;
    }

    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  return String(value);
}

function buildMetricRows(boxActivity, deviceActivities, devicesById) {
  const statusItems = [];

  const boxLeaves = flattenPayload(boxActivity?.payload || {}).map((item) => ({
    source: "box",
    sourceLabel: "Box",
    path: item.path,
    value: item.value,
    updatedAt: boxActivity?.updatedAt,
  }));

  const deviceLeaves = deviceActivities.flatMap((activity) => {
    const device = devicesById.get(activity.entityId);
    const sourceLabel = device?.name || activity.entityId || "Device";

    return flattenPayload(activity.payload || {}).map((item) => ({
      source: "device",
      sourceLabel,
      path: item.path,
      value: item.value,
      updatedAt: activity.updatedAt,
    }));
  });

  const leaves = [...boxLeaves, ...deviceLeaves].filter(
    (item) => item.path && ["string", "number", "boolean"].includes(typeof item.value)
  );

  const interesting = leaves.filter((item) => {
    const path = item.path.toLowerCase();
    return (
      path.includes("temp") ||
      path.includes("humid") ||
      path.includes("status") ||
      path.includes("fan") ||
      path.includes("rpm") ||
      path.includes("door") ||
      path.includes("lock") ||
      path.includes("connect") ||
      path.includes("online")
    );
  });

  const source = interesting.length > 0 ? interesting : leaves;

  source.slice(0, 12).forEach((item) => {
    const labelParts = [
      item.source === "device" ? item.sourceLabel : null,
      startCaseLabel(item.path),
    ].filter(Boolean);

    statusItems.push({
      name: labelParts.join(" | "),
      value: formatMetricValue(item.path, item.value),
      status: inferMetricStatus(item.path, item.value),
      time: formatRelativeTime(item.updatedAt),
      path: item.path,
      rawValue: item.value,
    });
  });

  return statusItems;
}

function findMetricByPath(rows, matcher) {
  return rows.find((row) => matcher(row.path.toLowerCase(), row.rawValue));
}

function buildStatCards(rows) {
  const temperatureMetric = findMetricByPath(
    rows,
    (path, value) => typeof value === "number" && path.includes("temp")
  );

  const humidityMetric = findMetricByPath(
    rows,
    (path, value) => typeof value === "number" && path.includes("humid")
  );

  return [
    {
      type: "temp",
      label: temperatureMetric?.name || "Internal Temperature",
      value: temperatureMetric ? Number(temperatureMetric.rawValue).toFixed(1) : "--",
      unit: temperatureMetric ? "C" : "",
      limit: "15C - 35C",
      trend: temperatureMetric ? temperatureMetric.time : "No reading",
      trendTone: "neutral",
      status: temperatureMetric?.status === "warning" ? "WARNING" : "NORMAL",
    },
    {
      type: "humidity",
      label: humidityMetric?.name || "Relative Humidity",
      value: humidityMetric ? Number(humidityMetric.rawValue).toFixed(1) : "--",
      unit: humidityMetric ? "%" : "",
      limit: "30% - 60%",
      trend: humidityMetric ? humidityMetric.time : "No reading",
      trendTone: "neutral",
      status: humidityMetric?.status === "warning" ? "WARNING" : "NORMAL",
    },
  ];
}

function buildAlerts(rows, box, boxActivity) {
  const alerts = rows
    .filter((row) => row.status === "warning" || row.status === "error")
    .slice(0, 6)
    .map((row) => ({
      tone: row.status === "error" ? "error" : "warning",
      title: row.name,
      description: `${row.value} detected from latest status payload.`,
      level: row.status === "error" ? "Critical level 2" : "Critical level 1",
    }));

  if (alerts.length === 0 && box?.active === false) {
    alerts.push({
      tone: "error",
      title: "Box disabled",
      description: `${box.name || box.boxId} is currently marked as disabled.`,
      level: "Critical level 2",
    });
  }

  if (alerts.length === 0 && !boxActivity) {
    alerts.push({
      tone: "info",
      title: "Waiting for status payload",
      description: "This box has not published a status activity yet.",
      level: "Info",
    });
  }

  return alerts;
}

function findPayloadValue(payload, matchers = []) {
  const leaves = flattenPayload(payload);

  return leaves.find((item) => {
    const path = item.path.toLowerCase();
    return matchers.some((matcher) => path.includes(matcher));
  })?.value;
}

function buildSystemIdentity(box, boxActivity, relatedDevices) {
  const payload = boxActivity?.payload || {};
  const connectionValue = findPayloadValue(payload, ["connection", "connected", "online", "network"]);
  const firmwareValue = findPayloadValue(payload, ["firmware", "version"]);
  const modelValue = findPayloadValue(payload, ["model", "hardware"]);

  const isConnected = typeof connectionValue === "boolean"
    ? connectionValue
    : String(connectionValue || box?.status || "").toLowerCase().includes("online");

  return [
    { label: "Box ID", value: box?.boxId || box?.id || "Unknown" },
    { label: "Location", value: box?.location || "Unknown" },
    { label: "Devices", value: String(relatedDevices.length || 0) },
    { label: "Model", value: modelValue ? String(modelValue) : (box?.name || "Unknown") },
    { label: "Firmware", value: firmwareValue ? String(firmwareValue) : "Not reported" },
    {
      label: "Connection",
      value: isConnected ? "Connected" : (box?.status || "Unknown"),
      status: isConnected ? "active" : undefined,
    },
  ];
}

export default function EnvironmentDashboard() {
  const { role, loading: authLoading, currentOrganizationId } = useAuth();
  const [searchParams] = useSearchParams();
  const boxId = searchParams.get("boxId") || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [box, setBox] = useState(null);
  const [relatedDevices, setRelatedDevices] = useState([]);
  const [boxActivity, setBoxActivity] = useState(null);
  const [deviceActivities, setDeviceActivities] = useState([]);

  const loadEnvironment = useCallback(async (isRefresh = false) => {
    if (!boxId || !currentOrganizationId) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [boxes, devices, boxStatusActivities, deviceStatusActivities] = await Promise.all([
        getBoxes(200),
        getDevices(200),
        getActivities({
          type: "box",
          entityId: boxId,
          activityType: "status",
          limit: 1,
        }),
        getActivities({
          type: "device",
          activityType: "status",
          limit: 200,
        }),
      ]);

      const currentBox = boxes.find((item) => getBoxId(item) === boxId) || null;
      const currentDevices = devices.filter((device) => {
        const deviceId = getDeviceId(device);

        return (
          (device.boxId || "") === boxId ||
          (Array.isArray(currentBox?.deviceIds) && currentBox.deviceIds.includes(deviceId))
        );
      });

      const currentDeviceIds = new Set(currentDevices.map((device) => getDeviceId(device)));
      const currentDeviceActivities = deviceStatusActivities.filter((activity) =>
        currentDeviceIds.has(activity.entityId)
      );

      setBox(currentBox);
      setRelatedDevices(currentDevices);
      setBoxActivity(boxStatusActivities[0] || null);
      setDeviceActivities(currentDeviceActivities);
    } catch (err) {
      console.error("Failed to load environment dashboard:", err);
      setError(err.message || "Failed to load environment dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [boxId, currentOrganizationId]);

  useEffect(() => {
    loadEnvironment();
  }, [loadEnvironment]);

  const devicesById = useMemo(() => {
    const map = new Map();
    relatedDevices.forEach((device) => {
      map.set(getDeviceId(device), device);
    });
    return map;
  }, [relatedDevices]);

  const sensorRows = useMemo(
    () => buildMetricRows(boxActivity, deviceActivities, devicesById),
    [boxActivity, deviceActivities, devicesById]
  );

  const statCards = useMemo(() => buildStatCards(sensorRows), [sensorRows]);
  const alerts = useMemo(() => buildAlerts(sensorRows, box, boxActivity), [sensorRows, box, boxActivity]);
  const identityInfo = useMemo(
    () => buildSystemIdentity(box, boxActivity, relatedDevices),
    [box, boxActivity, relatedDevices]
  );

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canUseOperationsDashboard(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  if (!boxId) {
    return (
      <PageShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <PageHeader
          title="Environment Dashboard"
          subtitle="Open a specific box from the Equipment page."
          setSidebarOpen={setSidebarOpen}
        />

        <SurfaceCard className="rounded-[28px] p-10 text-center shadow-sm">
          <div className="mx-auto max-w-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
              <Box size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-800">No box selected</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Open this page from Equipment so we know which box activity feed should be displayed.
            </p>
            <Link
              to="/equipment"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Go to Equipment
            </Link>
          </div>
        </SurfaceCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      shellClassName="flex min-h-screen bg-[#f8fafc]"
      mainClassName="w-full flex-1 overflow-y-auto p-4 md:p-8"
    >
      <PageHeader
        title="Environment Dashboard"
        subtitle={`${box?.name || boxId} | ${box?.location || "Unknown location"}`}
        setSidebarOpen={setSidebarOpen}
        onRefresh={() => loadEnvironment(true)}
        refreshing={refreshing}
        action={(
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 md:flex">
            <MapPin size={14} />
            {boxId}
          </div>
        )}
      />

      {loading && (
        <StatusBanner className="mb-6">
          Loading environment activity...
        </StatusBanner>
      )}

      {error && (
        <StatusBanner tone="error" className="mb-6">
          {error}
        </StatusBanner>
      )}

      {!loading && !error && !box && (
        <StatusBanner tone="error" className="mb-6">
          {`Box ${boxId} was not found.`}
        </StatusBanner>
      )}

      {(loading || box) && (
        <div className="grid grid-cols-12 gap-5 md:gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>

            <div className="w-full overflow-hidden">
              <SensorTable rows={sensorRows} loading={loading} />
            </div>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-4">
            <AlertsPanel alerts={alerts} loading={loading} />
            <SystemIdentity info={identityInfo} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
