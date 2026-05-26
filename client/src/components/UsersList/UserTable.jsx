import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";
import UserRow from "./UserRow";
import SurfaceCard from "../surfaceCard";
import { formatRoleLabel, getPreferredCardUid } from "../../utils/currentUser";
import { useToast } from "../../toast/ToastProvider";

function getUserId(user) {
  return user.id || user.userId || user.authUid;
}

function getActiveRfid(user) {
  return getPreferredCardUid(user) || "-";
}

function formatSessionLimit(user) {
  const seconds = Number(user.sessionDurationSec);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return user.role === "admin" ? "Unlimited" : "Default";
  }

  const minutes = Math.round(seconds / 60);

  if (minutes >= 60) {
    const hours = minutes / 60;

    return Number.isInteger(hours)
      ? `${hours} Hours`
      : `${hours.toFixed(1)} Hours`;
  }

  return `${minutes} Min`;
}

function buildDeviceMaps(devices) {
  const map = new Map();

  devices.forEach((device) => {
    if (device.id) map.set(device.id, device);
    if (device.deviceId) map.set(device.deviceId, device);
  });

  return map;
}

function getAllowedEquipmentNames(user, deviceMap) {
  const allowedDeviceIds = Array.isArray(user.allowedDeviceIds)
    ? user.allowedDeviceIds
    : [];

  if (allowedDeviceIds.length === 0) {
    return [];
  }

  return allowedDeviceIds.map((deviceId) => {
    const device = deviceMap.get(deviceId);
    return device?.name || device?.deviceId || deviceId;
  });
}

function mapUserForRow(user, deviceMap) {
  return {
    id: getUserId(user),
    raw: user,
    name: user.name || user.email || "Unnamed User",
    role: formatRoleLabel(user.role),
    rfid: getActiveRfid(user),
    equipment: getAllowedEquipmentNames(user, deviceMap),
    limit: formatSessionLimit(user),
    status: user.active === true ? "Active" : "Inactive",
  };
}

export default function UserTable({
  activeTab,
  users = [],
  devices = [],
  loading = false,
  onEditUser,
  onDeleteUser,
}) {
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeTab, users.length]);

  const deviceMap = useMemo(() => buildDeviceMaps(devices), [devices]);
  const rows = useMemo(
    () => users.map((user) => mapUserForRow(user, deviceMap)),
    [users, deviceMap]
  );

  const filteredUsers = rows.filter((user) => {
    if (activeTab === "All Users") return true;
    if (activeTab === "Admins") return user.role === "Admin";
    if (activeTab === "Technicians") return user.role === "Technician";
    if (activeTab === "Users") return user.role === "User";

    return true;
  });

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(start, end);

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await onDeleteUser?.(confirmDelete);
      setConfirmDelete(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Delete failed", err.message || "The user could not be deleted.");
    }
  };

  return (
    <div className="w-full">
      <SurfaceCard className="overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full border-collapse text-left">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">RFID Card ID</th>
                <th className="px-6 py-4">Allowed Equipment</th>
                <th className="px-6 py-4">Session Time Limit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && paginatedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    {...user}
                    onEdit={() => onEditUser?.(user.raw)}
                    onDelete={() => setConfirmDelete(user.id)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {!loading && filteredUsers.length > 0 && (
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[320px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Delete user?
            </h2>

            <p className="mb-6 text-slate-600">
              Are you sure you want to delete this user? This will remove the
              user from Firestore and Firebase Authentication.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
