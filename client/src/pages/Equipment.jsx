import { useEffect, useMemo, useState } from "react";
import LoadingScreen from "../components/loadingScreen";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import HeaderEquipment from "../components/Equipment/HeaderEquipment";
import ListEquipment from "../components/Equipment/ListEquipment";
import ReminderEquipment from "../components/Equipment/ReminderEquipment";
import { getDevices } from "../api/equipment";
import { useAuth } from "../auth/AuthContext";

function getDeviceId(device) {
  return device.deviceId || device.id;
}

function normalizeDeviceStatus(device) {
  if (device.active === false) return "DISABLED";

  const status = String(device.status || "idle").toLowerCase();

  if (status === "idle" || status === "free") return "FREE";
  if (status === "busy" || status === "in_use" || status === "reserved") {
    return "IN USE";
  }

  return status.toUpperCase();
}

function mapDeviceForEquipment(device, currentUser) {
  const deviceId = getDeviceId(device);

  return {
    id: deviceId,
    deviceId,
    name: device.name || deviceId,
    type: device.type || "device",
    boxId: device.boxId || null,
    status: normalizeDeviceStatus(device),
    access: true,
    sessionLimit: Math.round((currentUser?.sessionDurationSec || 1800) / 60),
    raw: device,
  };
}

const Equipment = () => {
  const { profile, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEquipment = async () => {
    setLoading(true);
    setError("");

    try {
      const devicesList = await getDevices(100);
      setDevices(devicesList);
    } catch (err) {
      console.error("Failed to load equipment:", err);
      setError(err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadEquipment();
    }
  }, [authLoading]);

  const currentUserDevices = useMemo(() => {
    if (!profile) return [];

    const allowedDeviceIds = new Set(profile.allowedDeviceIds || []);

    return devices
      .filter((device) => {
        const deviceId = getDeviceId(device);

        return (
          allowedDeviceIds.has(deviceId) ||
          allowedDeviceIds.has(device.id) ||
          allowedDeviceIds.has(device.deviceId)
        );
      })
      .map((device) => mapDeviceForEquipment(device, profile));
  }, [profile, devices]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      mainClassName="flex-1 overflow-y-auto p-6 md:p-8"
    >
        <HeaderEquipment
          title="My Equipment"
          setSidebarOpen={setSidebarOpen}
        />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Available devices
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Devices assigned to{" "}
            <span className="font-semibold text-slate-700">
              {profile?.name || profile?.email || "current user"}
            </span>
          </p>
        </div>

        {loading && (
          <StatusBanner className="mb-6">
            Loading equipment...
          </StatusBanner>
        )}

        {error && (
          <StatusBanner tone="error" className="mb-6">
            {error}
          </StatusBanner>
        )}

        {!loading && !error && (
          <ListEquipment
            permissions={currentUserDevices}
            readOnly
          />
        )}

        <ReminderEquipment />
    </PageShell>
  );
};

export default Equipment;
