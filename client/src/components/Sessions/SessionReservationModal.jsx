import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
      {children}
    </label>
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

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-orange-400 ${props.className || ""}`.trim()}
    />
  );
}

export default function SessionReservationModal({
  open,
  boxes = [],
  devices = [],
  defaultDurationSec = 1800,
  activeCardUid = "",
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [boxId, setBoxId] = useState("");
  const [deviceIds, setDeviceIds] = useState([]);
  const [sessionDurationSec, setSessionDurationSec] = useState(String(defaultDurationSec || 1800));

  useEffect(() => {
    if (!open) {
      return;
    }

    const firstBoxId = boxes[0]?.boxId || boxes[0]?.id || "";
    setBoxId(firstBoxId);
    setDeviceIds([]);
    setSessionDurationSec(String(defaultDurationSec || 1800));
  }, [open, defaultDurationSec]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const currentBoxStillExists = boxes.some(
      (box) => (box.boxId || box.id || "") === boxId
    );

    if (!boxId || !currentBoxStillExists) {
      const firstBoxId = boxes[0]?.boxId || boxes[0]?.id || "";
      setBoxId(firstBoxId);
      setDeviceIds([]);
    }
  }, [open, boxes, boxId]);

  const availableDevices = useMemo(
    () => devices.filter((device) => (device.boxId || "") === boxId),
    [devices, boxId]
  );
  const freeDevices = useMemo(
    () =>
      availableDevices.filter((device) => {
        const status = String(device.occupancy?.status || "").toLowerCase();
        return status !== "pending" && status !== "active";
      }),
    [availableDevices]
  );

  if (!open) {
    return null;
  }

  const toggleDevice = (deviceId) => {
    setDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((item) => item !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleBoxChange = (nextBoxId) => {
    setBoxId(nextBoxId);
    setDeviceIds([]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({
      boxId,
      uid: activeCardUid,
      deviceIds,
      sessionDurationSec: Number(sessionDurationSec || defaultDurationSec || 1800),
      mode: "manual",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Create Reservation</h2>
            <p className="mt-1 text-sm text-slate-500">
              Reserve devices under one box for the current RFID card.
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
          <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Choose one box, then select the free devices inside it. The reservation becomes active only after you tap this RFID card at the box.
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <FieldLabel>RFID Card UID</FieldLabel>
              <TextInput value={activeCardUid} disabled />
            </div>

            <div>
              <FieldLabel>Session Duration (Seconds)</FieldLabel>
              <TextInput
                type="number"
                min="0"
                value={sessionDurationSec}
                onChange={(event) => setSessionDurationSec(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel>Box</FieldLabel>
              <SelectInput
                value={boxId}
                onChange={(event) => handleBoxChange(event.target.value)}
              >
                <option value="">Select box</option>
                {boxes.map((box) => {
                  const value = box.boxId || box.id;
                  return (
                    <option key={value} value={value}>
                      {box.name || value}
                    </option>
                  );
                })}
              </SelectInput>
            </div>
          </div>

          <div>
            <FieldLabel>Devices</FieldLabel>
            <div className="mt-3 rounded-2xl border border-slate-200 px-4 py-4">
              {!boxId ? (
                <p className="text-sm text-slate-500">Select a box first.</p>
              ) : availableDevices.length === 0 ? (
                <p className="text-sm text-slate-500">No reservable devices in this box. The box may be offline, in maintenance, or have no assigned devices.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400">
                    Only devices that are free right now can be selected.
                  </p>
                  <div className="flex flex-wrap gap-2">
                  {freeDevices.map((device) => {
                    const deviceId = device.deviceId || device.id;
                    const selected = deviceIds.includes(deviceId);

                    return (
                      <button
                        key={deviceId}
                        type="button"
                        onClick={() => toggleDevice(deviceId)}
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

                  {availableDevices.some((device) => {
                    const status = String(device.occupancy?.status || "").toLowerCase();
                    return status === "pending" || status === "active";
                  }) && (
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                        Unavailable right now
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableDevices
                          .filter((device) => {
                            const status = String(device.occupancy?.status || "").toLowerCase();
                            return status === "pending" || status === "active";
                          })
                          .map((device) => {
                            const deviceId = device.deviceId || device.id;
                            const occupancyUserName =
                              device.occupancy?.userName || device.occupancy?.userId || "another user";
                            const occupancyStatus = String(device.occupancy?.status || "").toLowerCase();

                            return (
                              <span
                                key={deviceId}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500"
                              >
                                {device.name || deviceId} | {occupancyStatus === "active" ? `in use by ${occupancyUserName}` : `reserved by ${occupancyUserName}`}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-4 border-t border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          <p className="text-xs leading-5 text-slate-500">
            The reservation button stays disabled until you choose a box, select at least one free device, and have an active RFID card.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || !boxId || deviceIds.length === 0 || !activeCardUid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Plus size={16} />
            Create Reservation
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}
