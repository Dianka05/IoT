import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Plus } from "lucide-react";
import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import ListEquipment from "../components/Equipment/ListEquipment";
import ReminderEquipment from "../components/Equipment/ReminderEquipment";
import EquipmentEntityModal from "../components/Equipment/EquipmentEntityModal";
import EquipmentOperationsView from "../components/Equipment/EquipmentOperationsView";
import {
  createBox,
  createDevice,
  deleteBox,
  deleteDevice,
  getBoxes,
  getDevices,
  updateBox,
  updateDevice,
} from "../api/equipment";
import { useAuth } from "../auth/AuthContext";
import { canUseOperationsDashboard } from "../auth/roles";
import { getDisplayStatus } from "../utils/equipmentStatus";
import { useToast } from "../toast/ToastProvider";

function getDeviceId(device) {
  return device?.deviceId || device?.id || "";
}

function getBoxId(box) {
  return box?.boxId || box?.id || "";
}

function normalizeDeviceStatus(device) {
  const status = getDisplayStatus(device);
  if (status === "disabled") return "DISABLED";

  if (status === "idle" || status === "free") return "FREE";
  if (status === "busy" || status === "in_use" || status === "reserved") {
    return "IN USE";
  }
  if (status === "online" || status === "active") return "ONLINE";
  if (status === "offline") return "OFFLINE";

  return status.toUpperCase();
}

function mapDeviceForEquipment(device, currentUser) {
  const deviceId = getDeviceId(device);
  const occupancyStatus = String(device?.occupancy?.status || "").toLowerCase();
  const occupancyUserName = device?.occupancy?.userName || device?.occupancy?.userId || "";
  const occupancyLabel = occupancyUserName
    ? occupancyStatus === "active"
      ? `In use by ${occupancyUserName}`
      : occupancyStatus === "ready_for_auth"
        ? `Ready for ${occupancyUserName}`
        : occupancyStatus === "missed"
          ? `Late claim for ${occupancyUserName}`
        : ""
    : occupancyStatus === "active"
      ? "Currently in use"
      : occupancyStatus === "ready_for_auth"
        ? "Waiting for RFID confirmation"
        : occupancyStatus === "missed"
          ? "Late claim window"
        : "";

  return {
    id: deviceId,
    deviceId,
    name: device.name || deviceId,
    type: device.type || "device",
    boxId: device.boxId || null,
    status: normalizeDeviceStatus(device),
    access: true,
    sessionLimit: Math.round((currentUser?.sessionDurationSec || 1800) / 60),
    occupancyLabel,
    raw: device,
  };
}

function toNullableString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function uniqueSortedIds(ids = []) {
  return [...new Set(ids.filter(Boolean))].sort();
}

function areIdArraysEqual(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

const emptyModalState = {
  open: false,
  entityType: "box",
  mode: "create",
  initialValues: null,
};

const Equipment = () => {
  const toast = useToast();
  const { profile, role, loading: authLoading, currentOrganizationId } = useAuth();
  const isOperationsRole = canUseOperationsDashboard(role);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState(emptyModalState);

  const loadEquipment = useCallback(async (isRefresh = false) => {
    if (authLoading || !currentOrganizationId) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      if (isOperationsRole) {
        const [boxesList, devicesList] = await Promise.all([
          getBoxes(200),
          getDevices(200),
        ]);

        setBoxes(boxesList);
        setDevices(devicesList);
      } else {
        const devicesList = await getDevices(200);
        setDevices(devicesList);
        setBoxes([]);
      }
    } catch (err) {
      console.error("Failed to load equipment:", err);
      setError(err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, currentOrganizationId, isOperationsRole]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const syncBoxesWithDevices = useCallback(async (nextBoxes, nextDevices) => {
    const assignmentMap = new Map(
      nextBoxes.map((box) => [getBoxId(box), []])
    );

    nextDevices.forEach((device) => {
      const boxId = device.boxId || "";
      const deviceId = getDeviceId(device);

      if (boxId && deviceId && assignmentMap.has(boxId)) {
        assignmentMap.get(boxId).push(deviceId);
      }
    });

    const syncJobs = nextBoxes
      .map((box) => {
        const boxId = getBoxId(box);
        const nextIds = uniqueSortedIds(assignmentMap.get(boxId) || []);
        const currentIds = uniqueSortedIds(box.deviceIds || []);

        if (areIdArraysEqual(nextIds, currentIds)) {
          return null;
        }

        return updateBox(boxId, { deviceIds: nextIds });
      })
      .filter(Boolean);

    if (syncJobs.length > 0) {
      await Promise.all(syncJobs);
    }
  }, []);

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

  const closeModal = () => {
    if (submitting || deleting) {
      return;
    }

    setModalState(emptyModalState);
  };

  const openCreateBox = () => {
    setModalState({
      open: true,
      entityType: "box",
      mode: "create",
      initialValues: null,
    });
  };

  const openEditBox = (box) => {
    const boxId = getBoxId(box);
    const linkedDeviceIds = uniqueSortedIds([
      ...(box.deviceIds || []),
      ...devices
        .filter((device) => (device.boxId || "") === boxId)
        .map((device) => getDeviceId(device)),
    ]);

    setModalState({
      open: true,
      entityType: "box",
      mode: "edit",
      initialValues: {
        ...box,
        deviceIds: linkedDeviceIds,
      },
    });
  };

  const openCreateDevice = (boxId = "") => {
    setModalState({
      open: true,
      entityType: "device",
      mode: "create",
      initialValues: {
        boxId,
      },
    });
  };

  const openEditDevice = (device) => {
    setModalState({
      open: true,
      entityType: "device",
      mode: "edit",
      initialValues: device,
    });
  };

  const handleBoxSubmit = async (values) => {
    const nextBoxId = String(values.boxId || "").trim();
    const currentBoxId = getBoxId(modalState.initialValues);
    const effectiveBoxId = modalState.mode === "create" ? nextBoxId : currentBoxId;
    const name = String(values.name || "").trim();
    const selectedDeviceIds = uniqueSortedIds(values.deviceIds || []);

    if (!effectiveBoxId) {
      setError("Box ID is required");
      return;
    }

    if (!name) {
      setError("Box name is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name,
        location: toNullableString(values.location),
        active: values.active !== false,
        status: String(values.status || "offline").trim() || "offline",
        deviceIds: selectedDeviceIds,
      };

      let savedBox;

      if (modalState.mode === "create") {
        savedBox = await createBox({
          boxId: effectiveBoxId,
          ...payload,
        });
      } else {
        savedBox = await updateBox(effectiveBoxId, payload);
      }

      const nextDevices = devices.map((device) => {
        const deviceId = getDeviceId(device);

        if (!deviceId) {
          return device;
        }

        if (selectedDeviceIds.includes(deviceId)) {
          return {
            ...device,
            boxId: effectiveBoxId,
          };
        }

        if ((device.boxId || "") === effectiveBoxId) {
          return {
            ...device,
            boxId: null,
          };
        }

        return device;
      });

      const devicePatchJobs = devices
        .map((device, index) => {
          const deviceId = getDeviceId(device);
          const nextBoxIdValue = nextDevices[index]?.boxId || null;
          const currentBoxIdValue = device.boxId || null;

          if (!deviceId || currentBoxIdValue === nextBoxIdValue) {
            return null;
          }

          return updateDevice(deviceId, { boxId: nextBoxIdValue });
        })
        .filter(Boolean);

      if (devicePatchJobs.length > 0) {
        await Promise.all(devicePatchJobs);
      }

      const nextBoxes = modalState.mode === "create"
        ? [...boxes, { ...savedBox, boxId: effectiveBoxId, deviceIds: selectedDeviceIds }]
        : boxes.map((box) => (
            getBoxId(box) === effectiveBoxId
              ? { ...box, ...savedBox, boxId: effectiveBoxId, deviceIds: selectedDeviceIds }
              : box
          ));

      await syncBoxesWithDevices(nextBoxes, nextDevices);
      setModalState(emptyModalState);
      await loadEquipment(true);
      toast.success(
        modalState.mode === "create" ? "Box created" : "Box updated",
        modalState.mode === "create"
          ? "The box is now available in the workspace."
          : "The box settings were saved."
      );
    } catch (err) {
      console.error("Failed to save box:", err);
      setError(err.message || "Failed to save box");
      toast.error("Save failed", err.message || "The box could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeviceSubmit = async (values) => {
    const currentDeviceId = getDeviceId(modalState.initialValues);
    const effectiveDeviceId = modalState.mode === "create"
      ? String(values.deviceId || "").trim()
      : currentDeviceId;
    const name = String(values.name || "").trim();
    const type = String(values.type || "").trim();

    if (!effectiveDeviceId) {
      setError("Device ID is required");
      return;
    }

    if (!name) {
      setError("Device name is required");
      return;
    }

    if (!type) {
      setError("Device type is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name,
        type,
        boxId: toNullableString(values.boxId),
        active: values.active !== false,
        status: String(values.status || "idle").trim() || "idle",
      };

      let savedDevice;

      if (modalState.mode === "create") {
        savedDevice = await createDevice({
          deviceId: effectiveDeviceId,
          ...payload,
        });
      } else {
        savedDevice = await updateDevice(effectiveDeviceId, payload);
      }

      const mergedDevice = {
        ...modalState.initialValues,
        ...savedDevice,
        deviceId: effectiveDeviceId,
        ...payload,
      };

      const nextDevices = modalState.mode === "create"
        ? [...devices, mergedDevice]
        : devices.map((device) => (
            getDeviceId(device) === effectiveDeviceId
              ? { ...device, ...mergedDevice }
              : device
          ));

      await syncBoxesWithDevices(boxes, nextDevices);
      setModalState(emptyModalState);
      await loadEquipment(true);
      toast.success(
        modalState.mode === "create" ? "Device created" : "Device updated",
        modalState.mode === "create"
          ? "The device is now available in the workspace."
          : "The device settings were saved."
      );
    } catch (err) {
      console.error("Failed to save device:", err);
      setError(err.message || "Failed to save device");
      toast.error("Save failed", err.message || "The device could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!modalState.initialValues) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      if (modalState.entityType === "box") {
        const targetBoxId = getBoxId(modalState.initialValues);
        const nextDevices = devices.map((device) => (
          (device.boxId || "") === targetBoxId
            ? { ...device, boxId: null }
            : device
        ));

        const deviceResetJobs = devices
          .filter((device) => (device.boxId || "") === targetBoxId)
          .map((device) => updateDevice(getDeviceId(device), { boxId: null }));

        if (deviceResetJobs.length > 0) {
          await Promise.all(deviceResetJobs);
        }

        await deleteBox(targetBoxId);

        const nextBoxes = boxes.filter((box) => getBoxId(box) !== targetBoxId);
        await syncBoxesWithDevices(nextBoxes, nextDevices);
      } else {
        const targetDeviceId = getDeviceId(modalState.initialValues);
        await deleteDevice(targetDeviceId);

        const nextDevices = devices.filter((device) => getDeviceId(device) !== targetDeviceId);
        await syncBoxesWithDevices(boxes, nextDevices);
      }

      setModalState(emptyModalState);
      await loadEquipment(true);
      toast.success(
        modalState.entityType === "box" ? "Box deleted" : "Device deleted",
        modalState.entityType === "box"
          ? "The box was removed from the workspace."
          : "The device was removed from the workspace."
      );
    } catch (err) {
      console.error("Failed to delete entity:", err);
      setError(err.message || "Failed to delete item");
      toast.error("Delete failed", err.message || "The item could not be deleted.");
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSubmit = async (values) => {
    if (modalState.entityType === "box") {
      await handleBoxSubmit(values);
      return;
    }

    await handleDeviceSubmit(values);
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PageShell
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mainClassName="flex-1 overflow-y-auto p-6 md:p-8"
      >
        <PageHeader
          title="Equipment"
          subtitle={
            isOperationsRole
              ? "Manage workspace boxes and the devices assigned under each box."
              : "Configure and manage access permissions for IoT equipment."
          }
          setSidebarOpen={setSidebarOpen}
          onRefresh={() => loadEquipment(true)}
          refreshing={refreshing}
          action={isOperationsRole ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openCreateBox}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <Box size={16} />
                Add Box
              </button>

              <button
                type="button"
                onClick={() => openCreateDevice("")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Plus size={16} />
                Add Device
              </button>
            </div>
          ) : null}
        />

        {!isOperationsRole && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Available devices
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Devices assigned to{" "}
              <span className="font-semibold text-slate-700">
                {profile?.name || profile?.email || "current user"}
              </span>
            </p>
          </div>
        )}

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

        {!loading && !error && isOperationsRole && (
          <EquipmentOperationsView
            boxes={boxes}
            devices={devices}
            onAddBox={openCreateBox}
            onAddDevice={openCreateDevice}
            onEditBox={openEditBox}
            onEditDevice={openEditDevice}
          />
        )}

        {!loading && !error && !isOperationsRole && (
          <ListEquipment
            permissions={currentUserDevices}
            readOnly
          />
        )}

        {!isOperationsRole && <ReminderEquipment />}
      </PageShell>

      {isOperationsRole && (
        <EquipmentEntityModal
          open={modalState.open}
          entityType={modalState.entityType}
          mode={modalState.mode}
          initialValues={modalState.initialValues}
          boxes={boxes}
          devices={devices}
          submitting={submitting}
          deleting={deleting}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          onDelete={modalState.mode === "edit" ? handleDeleteCurrent : undefined}
        />
      )}
    </>
  );
};

export default Equipment;
