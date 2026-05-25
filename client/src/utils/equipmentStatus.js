function parseBooleanLike(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;

  if (["true", "1", "yes", "on", "online", "connected", "enabled"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off", "offline", "disconnected", "disabled"].includes(normalized)) {
    return false;
  }

  return null;
}

function toMillis(value) {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value?._seconds === "number") {
    return value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1000000);
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeMode(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.toUpperCase() : null;
}

export function getConnectivitySnapshot(entity = {}) {
  const connectivity = entity?.connectivity || {};
  const payload = entity?.lastStatusPayload || {};
  const statusOverride = String(
    entity?.statusOverride ??
      connectivity.statusOverride ??
      ""
  )
    .trim()
    .toLowerCase();

  const mode = normalizeMode(
    connectivity.mode ??
      payload.mode ??
      payload.operationMode ??
      null
  );

  const wifi = parseBooleanLike(
    connectivity.wifi ?? payload.wifi ?? null
  );

  const mqtt = parseBooleanLike(
    connectivity.mqtt ?? payload.mqtt ?? null
  );

  const online = parseBooleanLike(
    connectivity.online ??
      payload.online ??
      payload.connected ??
      payload.connection ??
      null
  );

  const reportedStatus = String(
    connectivity.reportedStatus ??
      payload.status ??
      payload.state ??
      entity?.status ??
      ""
  )
    .trim()
    .toLowerCase();

  const derivedStatus = String(
    connectivity.status ?? entity?.status ?? "offline"
  )
    .trim()
    .toLowerCase();
  const lastSeenAt = toMillis(connectivity.lastSeenAt ?? entity?.lastSeenAt ?? null);
  const staleAfterMs = 120000;
  const isStale = !lastSeenAt || Date.now() - lastSeenAt > staleAfterMs;
  const manuallyOffline =
    entity?.active === false || statusOverride === "offline";
  const manuallyMaintenance = statusOverride === "maintenance";

  return {
    mode,
    wifi: manuallyOffline || isStale ? false : wifi,
    mqtt: manuallyOffline || isStale ? false : mqtt,
    online: manuallyOffline || isStale ? false : online,
    reportedStatus,
    status: manuallyOffline
      ? "offline"
      : manuallyMaintenance
        ? "maintenance"
        : isStale
          ? "offline"
          : (derivedStatus || "offline"),
    lastSeenAt,
    isStale,
    statusOverride,
  };
}

export function getDisplayStatus(entity = {}) {
  const snapshot = getConnectivitySnapshot(entity);
  const baseStatus = snapshot.status || "offline";
  const occupancyStatus = String(entity?.occupancy?.status || "").toLowerCase();
  const boxStatus = String(entity?.boxState?.status || "").toLowerCase();

  if (boxStatus === "maintenance") {
    return "maintenance";
  }

  if (boxStatus === "offline") {
    return "offline";
  }

  if (baseStatus === "maintenance") {
    return "maintenance";
  }

  if (
    baseStatus === "offline" ||
    snapshot.online === false ||
    snapshot.wifi === false ||
    snapshot.mqtt === false
  ) {
    return "offline";
  }

  if (occupancyStatus === "active") {
    return "in_use";
  }

  if (occupancyStatus === "pending") {
    return "reserved";
  }

  return baseStatus;
}

export function isEntityOffline(entity = {}) {
  const snapshot = getConnectivitySnapshot(entity);
  return (
    entity?.active === false ||
    snapshot.online === false ||
    snapshot.wifi === false ||
    snapshot.mqtt === false ||
    snapshot.status === "offline"
  );
}
