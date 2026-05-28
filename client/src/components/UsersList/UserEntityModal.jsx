import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { formatCardUid } from "../../utils/currentUser";

const ROLE_OPTIONS = ["user", "technician", "admin"];
const CARD_STATUS_OPTIONS = ["active", "blocked", "lost"];

function getUserId(user) {
  return user?.id || user?.userId || user?.authUid || "";
}

function normalizeCards(cards = []) {
  const seen = new Set();

  return (Array.isArray(cards) ? cards : [])
    .map((card) => ({
      uid: String(card?.uid || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase(),
      status: String(card?.status || "active").toLowerCase(),
    }))
    .filter((card) => {
      if (!card.uid || seen.has(card.uid)) {
        return false;
      }

      seen.add(card.uid);
      return true;
    });
}

function normalizeFormValues(user) {
  return {
    userId: getUserId(user),
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "user",
    active: user?.active !== false,
    sessionDurationSec: String(user?.sessionDurationSec || 1800),
    cards: normalizeCards(user?.cards),
    allowedDeviceIds: Array.isArray(user?.allowedDeviceIds)
      ? user.allowedDeviceIds
      : [],
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

export default function UserEntityModal({
  open,
  mode = "create",
  initialValues = null,
  devices = [],
  submitting = false,
  deleting = false,
  organizationName = "",
  onClose,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(normalizeFormValues(initialValues));
  const [devicePicker, setDevicePicker] = useState("");
  const [newCardUid, setNewCardUid] = useState("");
  const [newCardStatus, setNewCardStatus] = useState("active");

  useEffect(() => {
    setForm(normalizeFormValues(initialValues));
    setDevicePicker("");
    setNewCardUid("");
    setNewCardStatus("active");
  }, [initialValues, open]);

  const sortedDevices = useMemo(
    () =>
      [...devices].sort((a, b) =>
        String(a.name || a.deviceId || a.id || "").localeCompare(
          String(b.name || b.deviceId || b.id || "")
        )
      ),
    [devices]
  );

  if (!open) {
    return null;
  }

  const modalTitle = mode === "edit" ? "Edit User" : "Add User";
  const modalSubtitle =
    mode === "edit"
      ? "Update system credentials and access permissions."
      : "Create a user in the current organization and assign access permissions.";

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addAllowedDevice = (nextDeviceId = devicePicker) => {
    if (!nextDeviceId) return;

    setForm((prev) => ({
      ...prev,
      allowedDeviceIds: prev.allowedDeviceIds.includes(nextDeviceId)
        ? prev.allowedDeviceIds
        : [...prev.allowedDeviceIds, nextDeviceId],
    }));
    setDevicePicker("");
  };

  const removeAllowedDevice = (deviceId) => {
    setForm((prev) => ({
      ...prev,
      allowedDeviceIds: prev.allowedDeviceIds.filter((item) => item !== deviceId),
    }));
  };

  const addCard = () => {
    const uid = String(newCardUid || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase();

    if (!uid) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      cards: normalizeCards([
        ...prev.cards,
        {
          uid,
          status: newCardStatus,
        },
      ]),
    }));

    setNewCardUid("");
    setNewCardStatus("active");
  };

  const buildCardsForSubmit = () => {
    const pendingUid = String(newCardUid || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase();

    if (!pendingUid) {
      return form.cards;
    }

    return normalizeCards([
      ...form.cards,
      {
        uid: pendingUid,
        status: newCardStatus,
      },
    ]);
  };

  const updateCard = (uid, patch) => {
    setForm((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.uid === uid
          ? {
              ...card,
              ...patch,
            }
          : card
      ),
    }));
  };

  const removeCard = (uid) => {
    setForm((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.uid !== uid),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({
      ...form,
      cards: buildCardsForSubmit(),
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this user?");
    if (confirmed) {
      onDelete?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] flex flex-col w-full max-w-5xl rounded-[28px] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{modalTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{modalSubtitle}</p>
            {organizationName && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                {organizationName}
              </p>
            )}
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
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <FieldLabel>Name</FieldLabel>
                <TextInput
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="Harry Potter"
                />
              </div>

              <div>
                <FieldLabel>Role</FieldLabel>
                <SelectInput
                  value={form.role}
                  onChange={(event) => setField("role", event.target.value)}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </SelectInput>
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Email Address</FieldLabel>
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  placeholder="testuser@example.com"
                />
                {mode === "create" && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    If this email already belongs to an existing account, the user will be added to the current organization instead of creating a second account.
                  </p>
                )}
              </div>

              {mode === "create" && (
                <div className="md:col-span-2">
                  <FieldLabel>Temporary Password</FieldLabel>
                  <TextInput
                    type="password"
                    value={form.password}
                    onChange={(event) => setField("password", event.target.value)}
                    placeholder="Only needed for a brand-new account"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Leave this empty if the email already belongs to an existing user in another organization. Existing users keep their current password.
                  </p>
                </div>
              )}

              <div>
                <FieldLabel>Session Duration (Seconds)</FieldLabel>
                <TextInput
                  type="number"
                  min="0"
                  value={form.sessionDurationSec}
                  onChange={(event) =>
                    setField("sessionDurationSec", event.target.value)
                  }
                  placeholder="3600"
                />
              </div>
            </div>

            <div>
              <FieldLabel>RFID Cards</FieldLabel>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="space-y-3">
                  {form.cards.length === 0 && (
                    <p className="text-sm text-slate-500">No cards added yet.</p>
                  )}

                  {form.cards.map((card) => (
                    <div
                      key={card.uid}
                      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.3fr_0.8fr_auto]"
                    >
                      <div>
                        <FieldLabel>Card UID</FieldLabel>
                        <TextInput
                          value={card.uid}
                          onChange={(event) =>
                            updateCard(card.uid, {
                              uid: event.target.value
                                .replace(/[^a-fA-F0-9]/g, "")
                                .toUpperCase(),
                            })
                          }
                          placeholder="A27A7B38"
                        />
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {formatCardUid(card.uid)}
                        </p>
                      </div>

                      <div>
                        <FieldLabel>Status</FieldLabel>
                        <SelectInput
                          value={card.status}
                          onChange={(event) =>
                            updateCard(card.uid, { status: event.target.value })
                          }
                        >
                          {CARD_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </SelectInput>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeCard(card.uid)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="grid gap-3 rounded-2xl border border-dashed border-orange-300 bg-white/70 p-4 md:grid-cols-[1.3fr_0.8fr_auto]">
                    <div>
                      <FieldLabel>New Card UID</FieldLabel>
                      <TextInput
                        value={newCardUid}
                        onChange={(event) =>
                          setNewCardUid(
                            event.target.value.replace(/[^a-fA-F0-9]/g, "").toUpperCase()
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCard();
                          }
                        }}
                        placeholder="A27A7B38"
                      />
                    </div>

                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <SelectInput
                        value={newCardStatus}
                        onChange={(event) => setNewCardStatus(event.target.value)}
                      >
                        {CARD_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </SelectInput>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addCard}
                        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-orange-300 px-4 py-2.5 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                      >
                        <Plus size={16} />
                        Add Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Allowed Device IDs</FieldLabel>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/40 px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {form.allowedDeviceIds.map((deviceId) => {
                    const device = sortedDevices.find(
                      (item) => (item.deviceId || item.id) === deviceId
                    );

                    return (
                      <button
                        key={deviceId}
                        type="button"
                        onClick={() => removeAllowedDevice(deviceId)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
                      >
                        {device?.name || deviceId} x
                      </button>
                    );
                  })}

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={devicePicker}
                      onChange={(event) => {
                        const nextDeviceId = event.target.value;
                        setDevicePicker(nextDeviceId);
                        if (nextDeviceId) {
                          addAllowedDevice(nextDeviceId);
                        }
                      }}
                      className="rounded-full border border-dashed border-orange-300 bg-white px-3 py-1.5 text-sm text-slate-600 outline-none transition focus:border-orange-400"
                    >
                      <option value="">Select device</option>
                      {sortedDevices
                        .filter(
                          (device) =>
                            !form.allowedDeviceIds.includes(
                              device.deviceId || device.id
                            )
                        )
                        .map((device) => {
                          const deviceId = device.deviceId || device.id;

                          return (
                            <option key={deviceId} value={deviceId}>
                              {device.name || deviceId}
                            </option>
                          );
                        })}
                    </select>

                    {sortedDevices.filter(
                      (device) =>
                        !form.allowedDeviceIds.includes(device.deviceId || device.id)
                    ).length === 0 && (
                      <span className="text-sm font-medium text-slate-400">
                        All devices already assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Active Status</p>
                <p className="mt-1 text-xs text-slate-500">
                  Enable or disable user access in the current organization.
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
        </div>

        <div className="sticky bottom-0 flex flex-col gap-4 border-t border-slate-100 bg-white px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
          <div className="order-2 md:order-1">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="w-full text-left text-sm font-semibold uppercase tracking-wide text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                Remove User
              </button>
            )}
          </div>

          <div className="order-1 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end md:order-2">
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
              {mode === "edit" ? "Save Changes" : "Create User"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
