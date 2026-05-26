import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

const BOX_STATUS_OPTIONS = ["offline", "idle", "online", "maintenance"];
const DEVICE_STATUS_OPTIONS = ["idle", "online", "offline", "busy", "maintenance"];

function normalizeBoxValues(item) {
  return {
    boxId: item?.boxId || item?.id || "",
    name: item?.name || "",
    location: item?.location || "",
    status: item?.status || "offline",
    active: item?.active !== false,
    deviceIds: Array.isArray(item?.deviceIds) ? item.deviceIds : [],
  };
}

function normalizeDeviceValues(item) {
  return {
    deviceId: item?.deviceId || item?.id || "",
    name: item?.name || "",
    type: item?.type || "",
    boxId: item?.boxId || "",
    status: item?.status || "idle",
    active: item?.active !== false,
  };
}

function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-orange-400 ${props.className || ""}`.trim()}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`w-full border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 ${props.className || ""}`.trim()}
    />
  );
}

export default function EquipmentEntityModal({
  open,
  entityType = "box",
  mode = "create",
  initialValues = null,
  boxes = [],
  devices = [],
  submitting = false,
  deleting = false,
  onClose,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(
    entityType === "box"
      ? normalizeBoxValues(initialValues)
      : normalizeDeviceValues(initialValues)
  );

  useEffect(() => {
    setForm(
      entityType === "box"
        ? normalizeBoxValues(initialValues)
        : normalizeDeviceValues(initialValues)
    );
  }, [entityType, initialValues, open]);

  const modalTitle = mode === "edit"
    ? `Edit ${entityType === "box" ? "Box" : "Device"}`
    : `Add ${entityType === "box" ? "Box" : "Device"}`;

  const modalSubtitle = entityType === "box"
    ? "Create or update a workspace box and control which devices belong to it."
    : "Create or update a device and assign it to the correct box.";

  const sortedBoxes = useMemo(
    () => [...boxes].sort((a, b) => String(a.name || a.boxId || "").localeCompare(String(b.name || b.boxId || ""))),
    [boxes]
  );

  const sortedDevices = useMemo(
    () => [...devices].sort((a, b) => String(a.name || a.deviceId || "").localeCompare(String(b.name || b.deviceId || ""))),
    [devices]
  );

  if (!open) {
    return null;
  }

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDeviceId = (deviceId) => {
    setForm((prev) => {
      const currentIds = Array.isArray(prev.deviceIds) ? prev.deviceIds : [];
      const exists = currentIds.includes(deviceId);

      return {
        ...prev,
        deviceIds: exists
          ? currentIds.filter((id) => id !== deviceId)
          : [...currentIds, deviceId],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(form);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete this ${entityType}?`);

    if (confirmed) {
      onDelete?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {modalTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {modalSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
          {entityType === "box" ? (
            <div className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <FieldLabel>Box ID</FieldLabel>
                  <TextInput
                    value={form.boxId}
                    onChange={(event) => setField("boxId", event.target.value)}
                    placeholder="main-1"
                    disabled={mode === "edit"}
                  />
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <SelectInput
                    value={form.status}
                    onChange={(event) => setField("status", event.target.value)}
                  >
                    {BOX_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <FieldLabel>Name</FieldLabel>
                  <TextInput
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="Main Box"
                  />
                </div>

                <div>
                  <FieldLabel>Location</FieldLabel>
                  <TextInput
                    value={form.location}
                    onChange={(event) => setField("location", event.target.value)}
                    placeholder="Lab A"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Assigned Devices</FieldLabel>
                <div className="mt-3 rounded-2xl border border-slate-200 px-4 py-4">
                  {sortedDevices.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No devices available yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sortedDevices.map((device) => {
                        const deviceId = device.deviceId || device.id;
                        const selected = form.deviceIds.includes(deviceId);

                        return (
                          <button
                            key={deviceId}
                            type="button"
                            onClick={() => toggleDeviceId(deviceId)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${
                              selected
                                ? "border-orange-200 bg-orange-50 text-orange-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {device.name || deviceId}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Active Status
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enable or disable this box in the workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setField("active", !form.active)}
                  className={`relative h-7 w-[52px] rounded-full transition ${
                    form.active ? "bg-orange-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      form.active ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <FieldLabel>Device ID</FieldLabel>
                  <TextInput
                    value={form.deviceId}
                    onChange={(event) => setField("deviceId", event.target.value)}
                    placeholder="fan-1"
                    disabled={mode === "edit"}
                  />
                </div>

                <div>
                  <FieldLabel>Type</FieldLabel>
                  <TextInput
                    value={form.type}
                    onChange={(event) => setField("type", event.target.value)}
                    placeholder="fan"
                  />
                </div>

                <div>
                  <FieldLabel>Name</FieldLabel>
                  <TextInput
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="Fan 1"
                  />
                </div>

                <div>
                  <FieldLabel>Box</FieldLabel>
                  <SelectInput
                    value={form.boxId}
                    onChange={(event) => setField("boxId", event.target.value)}
                  >
                    <option value="">No box</option>
                    {sortedBoxes.map((box) => {
                      const boxId = box.boxId || box.id;

                      return (
                        <option key={boxId} value={boxId}>
                          {box.name || boxId}
                        </option>
                      );
                    })}
                  </SelectInput>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Status</FieldLabel>
                  <SelectInput
                    value={form.status}
                    onChange={(event) => setField("status", event.target.value)}
                  >
                    {DEVICE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Active Status
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enable or disable this device in the workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setField("active", !form.active)}
                  className={`relative h-7 w-[52px] rounded-full transition ${
                    form.active ? "bg-orange-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      form.active ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-4 border-t border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
          <div>
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="w-full text-left text-sm font-semibold uppercase tracking-wide text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                Remove {entityType}
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || deleting}
              className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || deleting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Plus size={16} />
              {mode === "edit" ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
