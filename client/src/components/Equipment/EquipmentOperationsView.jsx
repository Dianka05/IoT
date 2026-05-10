import { Box, Cpu, MapPin, Pencil, Plus } from "lucide-react";
import SurfaceCard from "../surfaceCard";

function getBoxId(box) {
  return box.boxId || box.id;
}

function getDeviceId(device) {
  return device.deviceId || device.id;
}

function normalizeStatus(status, active = true) {
  if (active === false) {
    return {
      label: "Disabled",
      tone: "bg-slate-100 text-slate-500",
    };
  }

  const value = String(status || "idle").toLowerCase();

  if (value === "online" || value === "active") {
    return {
      label: "Online",
      tone: "bg-green-100 text-green-700",
    };
  }

  if (value === "busy" || value === "reserved" || value === "in_use") {
    return {
      label: "In Use",
      tone: "bg-orange-100 text-orange-700",
    };
  }

  if (value === "offline") {
    return {
      label: "Offline",
      tone: "bg-red-100 text-red-600",
    };
  }

  return {
    label: value.charAt(0).toUpperCase() + value.slice(1),
    tone: "bg-slate-100 text-slate-600",
  };
}

function buildBoxGroups(boxes = [], devices = []) {
  const boxLookup = new Map();
  const deviceIdsAssigned = new Set();
  const groups = boxes
    .map((box) => {
      const boxId = getBoxId(box);
      const group = {
        ...box,
        boxId,
        devices: [],
      };

      boxLookup.set(boxId, group);
      return group;
    })
    .sort((a, b) =>
      String(a.name || a.boxId || "").localeCompare(String(b.name || b.boxId || ""))
    );

  devices.forEach((device) => {
    const deviceId = getDeviceId(device);
    const directBoxId = device.boxId || "";
    const fallbackGroup = groups.find(
      (group) => Array.isArray(group.deviceIds) && group.deviceIds.includes(deviceId)
    );
    const targetGroup = boxLookup.get(directBoxId) || fallbackGroup;

    if (!targetGroup || deviceIdsAssigned.has(deviceId)) {
      return;
    }

    targetGroup.devices.push(device);
    deviceIdsAssigned.add(deviceId);
  });

  groups.forEach((group) => {
    group.devices.sort((a, b) =>
      String(a.name || a.deviceId || "").localeCompare(String(b.name || b.deviceId || ""))
    );
  });

  const unassignedDevices = devices
    .filter((device) => !deviceIdsAssigned.has(getDeviceId(device)))
    .sort((a, b) =>
      String(a.name || a.deviceId || "").localeCompare(String(b.name || b.deviceId || ""))
    );

  return {
    groups,
    unassignedDevices,
  };
}

function DeviceRow({ device, onEdit }) {
  const deviceId = getDeviceId(device);
  const status = normalizeStatus(device.status, device.active);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-3 text-slate-500 shadow-sm">
          <Cpu size={18} />
        </div>

        <div>
          <p className="font-bold text-slate-800">
            {device.name || deviceId}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {deviceId} | {device.type || "device"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${status.tone}`}>
          {status.label}
        </span>

        <button
          type="button"
          onClick={() => onEdit?.(device)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>
    </div>
  );
}

function BoxCard({ box, onEditBox, onAddDevice, onEditDevice }) {
  const status = normalizeStatus(box.status, box.active);
  const deviceCount = box.devices.length;

  return (
    <SurfaceCard className="rounded-[28px] p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-orange-50 p-4 text-orange-500">
              <Box size={22} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-black text-slate-800">
                  {box.name || box.boxId}
                </h3>
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${status.tone}`}>
                  {status.label}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {box.boxId}
                {box.location ? ` | ${box.location}` : ""}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <MapPin size={14} />
                {deviceCount} {deviceCount === 1 ? "device" : "devices"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onAddDevice?.(box.boxId)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Plus size={16} />
              Add Device
            </button>

            <button
              type="button"
              onClick={() => onEditBox?.(box)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit Box
            </button>
          </div>
        </div>

        {box.devices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-sm text-slate-500">
            This box does not have any devices yet.
          </div>
        ) : (
          <div className="space-y-3">
            {box.devices.map((device) => (
              <DeviceRow
                key={getDeviceId(device)}
                device={device}
                onEdit={onEditDevice}
              />
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}

export default function EquipmentOperationsView({
  boxes = [],
  devices = [],
  loading = false,
  onAddBox,
  onAddDevice,
  onEditBox,
  onEditDevice,
}) {
  const { groups, unassignedDevices } = buildBoxGroups(boxes, devices);

  if (!loading && groups.length === 0 && unassignedDevices.length === 0) {
    return (
      <SurfaceCard className="rounded-[28px] p-10 text-center shadow-sm">
        <div className="mx-auto flex max-w-lg flex-col items-center">
          <div className="rounded-3xl bg-orange-50 p-5 text-orange-500">
            <Box size={28} />
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-800">
            No boxes or devices yet
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Start by creating a box, then attach devices under it. Devices without a box can also be added first and assigned later.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onAddBox}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Plus size={16} />
              Add Box
            </button>

            <button
              type="button"
              onClick={() => onAddDevice?.("")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus size={16} />
              Add Device
            </button>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((box) => (
        <BoxCard
          key={box.boxId}
          box={box}
          onEditBox={onEditBox}
          onAddDevice={onAddDevice}
          onEditDevice={onEditDevice}
        />
      ))}

      {unassignedDevices.length > 0 && (
        <SurfaceCard className="rounded-[28px] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Unassigned Devices
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                These devices are not linked to any box yet.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddDevice?.("")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus size={16} />
              Add Device
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {unassignedDevices.map((device) => (
              <DeviceRow
                key={getDeviceId(device)}
                device={device}
                onEdit={onEditDevice}
              />
            ))}
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
