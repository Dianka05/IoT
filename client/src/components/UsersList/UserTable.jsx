import UserRow from "./UserRow";
import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";

function getUserId(user) {
  return user.id || user.userId || user.authUid;
}

function normalizeRole(role) {
  if (!role) return "User";

  const value = String(role).toLowerCase();

  if (value === "admin") return "Admin";
  if (value === "technician") return "Technician";

  return "User";
}

function getActiveRfid(user) {
  if (!Array.isArray(user.cards) || user.cards.length === 0) {
    return "—";
  }

  const activeCard = user.cards.find((card) => card.status === "active");
  const card = activeCard || user.cards[0];

  return card?.uid || "—";
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
  const role = normalizeRole(user.role);

  return {
    id: getUserId(user),
    name: user.name || user.email || "Unnamed User",
    role,
    rfid: getActiveRfid(user),
    equipment: getAllowedEquipmentNames(user, deviceMap),
    limit: formatSessionLimit(user),
    status: user.active === true ? "Active" : "Inactive",
  };
}

const UserTable = ({
  activeTab,
  users = [],
  devices = [],
  loading = false,
  onDeleteUser,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeTab, users.length]);

  const deviceMap = useMemo(() => buildDeviceMaps(devices), [devices]);

  const rows = useMemo(() => {
    return users.map((user) => mapUserForRow(user, deviceMap));
  }, [users, deviceMap]);

  const filteredUsers = rows.filter((u) => {
    if (activeTab === "All Users") return true;
    if (activeTab === "Admins") return u.role === "Admin";
    if (activeTab === "Technicians") return u.role === "Technician";
    if (activeTab === "Users") return u.role === "User";

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
      alert(err.message || "Failed to delete user");
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                paginatedUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    {...u}
                    onDelete={() => setConfirmDelete(u.id)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredUsers.length > 0 && (
        <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[320px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Delete user?
            </h2>

            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this user? This will remove the
              user from Firestore and Firebase Authentication.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;