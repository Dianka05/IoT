import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import UserStatsCards from "../components/UsersList/UserStatsCards";
import UserTabs from "../components/UsersList/UserTabs";
import UserTable from "../components/UsersList/UserTable";
import UserEntityModal from "../components/UsersList/UserEntityModal";

import {
  createUser,
  deleteUser,
  getDevices,
  getUsers,
  updateUser,
  updateUserCards,
  updateUserAllowedDeviceIds,
} from "../api/users";
import { canManageUsers, getDefaultRouteForRole } from "../auth/roles";
import { useAuth } from "../auth/AuthContext";

const emptyModalState = {
  open: false,
  mode: "create",
  initialValues: null,
};

function normalizeCardsFromForm(values) {
  const cards = Array.isArray(values.cards) ? values.cards : [];

  return cards
    .map((card) => ({
      uid: String(card?.uid || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase(),
      status: String(card?.status || "active").toLowerCase(),
    }))
    .filter((card) => card.uid);
}

function normalizeSessionDuration(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 1800;
  }

  return Math.round(parsed);
}

export default function UsersList() {
  const {
    role,
    loading: authLoading,
    currentOrganizationId,
    currentOrganization,
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Users");
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState(emptyModalState);

  const loadData = async () => {
    setError("");

    try {
      const [usersList, devicesList] = await Promise.all([
        getUsers(100),
        getDevices(100),
      ]);

      setUsers(usersList);
      setDevices(devicesList);
    } catch (err) {
      console.error("Failed to load users page:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentOrganizationId && canManageUsers(role)) {
      setLoading(true);
      loadData();
    }
  }, [authLoading, currentOrganizationId, role]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleDeleteUser = async (uid) => {
    await deleteUser(uid);

    setUsers((prev) =>
      prev.filter((user) => {
        const userId = user.id || user.userId || user.authUid;
        return userId !== uid;
      })
    );
  };

  const openCreateUser = () => {
    setModalState({
      open: true,
      mode: "create",
      initialValues: null,
    });
  };

  const openEditUser = (user) => {
    setModalState({
      open: true,
      mode: "edit",
      initialValues: user,
    });
  };

  const closeModal = () => {
    if (submitting || deleting) {
      return;
    }

    setModalState(emptyModalState);
  };

  const handleSubmitUser = async (values) => {
    setSubmitting(true);
    setError("");

    try {
      const cards = normalizeCardsFromForm(values);
      const payload = {
        name: String(values.name || "").trim(),
        email: String(values.email || "").trim(),
        role: values.role || "user",
        active: values.active !== false,
        sessionDurationSec: normalizeSessionDuration(values.sessionDurationSec),
      };

      if (!payload.name) {
        throw new Error("Name is required");
      }

      if (!payload.email) {
        throw new Error("Email is required");
      }

      if (modalState.mode === "create") {
        const password = String(values.password || "").trim();

        if (!password) {
          throw new Error("Temporary password is required");
        }

        await createUser({
          ...payload,
          cards,
          password,
          allowedDeviceIds: values.allowedDeviceIds || [],
        });
      } else {
        const userId =
          modalState.initialValues?.id ||
          modalState.initialValues?.userId ||
          modalState.initialValues?.authUid;

        await updateUser(userId, payload);
        await updateUserCards(userId, cards);
        await updateUserAllowedDeviceIds(userId, values.allowedDeviceIds || []);
      }

      setModalState(emptyModalState);
      await loadData();
    } catch (err) {
      console.error("Failed to save user:", err);
      setError(err.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCurrentUser = async () => {
    const userId =
      modalState.initialValues?.id ||
      modalState.initialValues?.userId ||
      modalState.initialValues?.authUid;

    if (!userId) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteUser(userId);
      setModalState(emptyModalState);
      await loadData();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canManageUsers(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return (
    <>
      <PageShell
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mainClassName="flex-1 overflow-x-hidden p-4 md:p-8"
        contentClassName="max-w-[1400px] mx-auto space-y-6"
      >
        <PageHeader
          title="System Users"
          subtitle="Manage and control access for all registered system users."
          setSidebarOpen={setSidebarOpen}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          action={(
            <button
              onClick={openCreateUser}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
            >
              <UserPlus size={20} />
              Add New User
            </button>
          )}
        />

        <UserStatsCards users={users} devices={devices} />

        <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {error && (
          <StatusBanner tone="error">
            {error}
          </StatusBanner>
        )}

        <UserTable
          activeTab={activeTab}
          users={users}
          devices={devices}
          loading={loading}
          onEditUser={openEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </PageShell>

      <UserEntityModal
        open={modalState.open}
        mode={modalState.mode}
        initialValues={modalState.initialValues}
        devices={devices}
        organizationName={currentOrganization?.name || currentOrganizationId || ""}
        submitting={submitting}
        deleting={deleting}
        onClose={closeModal}
        onSubmit={handleSubmitUser}
        onDelete={modalState.mode === "edit" ? handleDeleteCurrentUser : undefined}
      />
    </>
  );
}
