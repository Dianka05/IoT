import { useEffect, useMemo, useState } from "react";
import SidebarEquipment from "../components/AdminSidebar";
import HeaderEquipment from "../components/Equipment/HeaderEquipment";
import ListEquipment from "../components/Equipment/ListEquipment";
import ReminderEquipment from "../components/Equipment/ReminderEquipment";
import { getCurrentUser, getDevices } from "../api/equipment";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [devices, setDevices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEquipment = async () => {
    setLoading(true);
    setError("");

    try {
      const [me, devicesList] = await Promise.all([
        getCurrentUser(),
        getDevices(100),
      ]);

      setCurrentUser(me?.profile || null);
      setDevices(devicesList);
    } catch (err) {
      console.error("Failed to load equipment:", err);
      setError(err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const currentUserDevices = useMemo(() => {
    if (!currentUser) return [];

    const allowedDeviceIds = new Set(currentUser.allowedDeviceIds || []);

    return devices
      .filter((device) => {
        const deviceId = getDeviceId(device);

        return (
          allowedDeviceIds.has(deviceId) ||
          allowedDeviceIds.has(device.id) ||
          allowedDeviceIds.has(device.deviceId)
        );
      })
      .map((device) => mapDeviceForEquipment(device, currentUser));
  }, [currentUser, devices]);

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">
      <SidebarEquipment
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
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
              {currentUser?.name || currentUser?.email || "current user"}
            </span>
          </p>
        </div>

        {loading && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
            Loading equipment...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <ListEquipment
            permissions={currentUserDevices}
            readOnly
          />
        )}

        <ReminderEquipment />
      </main>
    </div>
  );
};

export default Equipment;