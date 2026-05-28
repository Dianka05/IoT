const {
  upsertActivity,
  getActivityByDocId,
  listActivities,
} = require('./activities.store.firestore')
const {
  getBoxById,
  updateBoxById,
} = require('../boxes/main-box/boxes.store.firestore')
const {
  getDeviceById,
  updateDeviceById,
} = require('../devices/fan-1/devices.store.firestore')
const { deriveConnectivityState } = require('../../shared/connectivity-state')
const { FieldValue } = require('../../integrations/firebase/firebase.client')
const {
  getPresenceDetectionConfigForBox,
} = require('../configuration/configuration.service')
const { logSuspiciousPresence } = require('../logs/logs.service')

const STATUS_PERSIST_INTERVAL_MS = Number(process.env.STATUS_PERSIST_INTERVAL_MS || 15000)
const ENTITY_CACHE_TTL_MS = 5 * 60 * 1000
const boxCache = new Map()
const deviceCache = new Map()
const statusWriteCache = new Map()

function toMillis(timestamp) {
  if (!timestamp) return null
  if (typeof timestamp?.toMillis === 'function') {
    return timestamp.toMillis()
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime()
  }
  if (typeof timestamp?._seconds === 'number') {
    return timestamp._seconds * 1000 + Math.floor((timestamp._nanoseconds || 0) / 1000000)
  }
  if (typeof timestamp === 'number') {
    return timestamp
  }
  return null
}

function toNullableNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getCachedEntity(cache, id) {
  const cached = cache.get(id)
  if (!cached) return null

  if (Date.now() - cached.createdAt > ENTITY_CACHE_TTL_MS) {
    cache.delete(id)
    return null
  }

  return cached.value
}

function setCachedEntity(cache, id, value) {
  cache.set(id, {
    createdAt: Date.now(),
    value,
  })
}

function buildStatusFingerprint(snapshot, payload = {}) {
  return JSON.stringify({
    status: snapshot.status || null,
    online: snapshot.connectivity?.online ?? null,
    wifi: snapshot.connectivity?.wifi ?? null,
    mqtt: snapshot.connectivity?.mqtt ?? null,
    mode: snapshot.connectivity?.mode ?? null,
    reportedStatus: snapshot.connectivity?.reportedStatus ?? null,
    temperatureC: toNullableNumber(payload.temperatureC),
    humidity: toNullableNumber(payload.humidity),
    motion: payload.motion === true,
    distanceCm: toNullableNumber(payload.distanceCm),
    activeSessions: toNullableNumber(payload.activeSessions),
  })
}

function shouldPersistStatus(entityKey, fingerprint) {
  const cached = statusWriteCache.get(entityKey)
  const nowMs = Date.now()

  if (!cached) {
    statusWriteCache.set(entityKey, {
      fingerprint,
      lastPersistAt: nowMs,
    })
    return true
  }

  if (cached.fingerprint !== fingerprint || nowMs - cached.lastPersistAt >= STATUS_PERSIST_INTERVAL_MS) {
    statusWriteCache.set(entityKey, {
      fingerprint,
      lastPersistAt: nowMs,
    })
    return true
  }

  return false
}

async function evaluateSuspiciousPresence(box, payload) {
  const organizationId = box.organizationId || null
  const boxId = box.boxId || box.id

  if (!organizationId || !boxId) {
    return
  }

  const config = await getPresenceDetectionConfigForBox(organizationId, boxId)
  const securityState = box.securityState || {}
  const distanceCm = toNullableNumber(payload.distanceCm)
  const motion = payload.motion === true
  const presenceDetected =
    config.enabled === true &&
    distanceCm !== null &&
    distanceCm <= Number(config.distanceCmThreshold || 0) &&
    (config.requireMotion !== true || motion)

  if (!presenceDetected) {
    if (securityState.presenceStartedAt || securityState.lastPresenceDistanceCm !== undefined) {
      await updateBoxById(boxId, {
        securityState: {
          ...securityState,
          presenceStartedAt: null,
          lastPresenceDistanceCm: distanceCm,
        },
      })
    }

    return
  }

  const nowMs = Date.now()
  const presenceStartedAtMs = toMillis(securityState.presenceStartedAt)
  const lastSuspiciousLoggedAtMs = toMillis(securityState.lastSuspiciousLoggedAt)
  const lastDeniedAtMs = toMillis(securityState.lastDeniedAt)
  const durationThresholdMs =
    Number(config.suspiciousPresenceDurationSec || 0) * 1000
  const cooldownMs =
    Number(config.suspiciousPresenceCooldownSec || 0) * 1000
  const deniedLookbackMs =
    Number(config.deniedAccessLookbackSec || 0) * 1000

  if (!presenceStartedAtMs) {
    await updateBoxById(boxId, {
      securityState: {
        ...securityState,
        presenceStartedAt: new Date(),
        lastPresenceDistanceCm: distanceCm,
      },
    })

    return
  }

  const durationMs = Math.max(0, nowMs - presenceStartedAtMs)
  const withinCooldown =
    lastSuspiciousLoggedAtMs !== null &&
    nowMs - lastSuspiciousLoggedAtMs < cooldownMs

  if (durationMs < durationThresholdMs || withinCooldown) {
    await updateBoxById(boxId, {
      securityState: {
        ...securityState,
        lastPresenceDistanceCm: distanceCm,
      },
    })

    return
  }

  const recentDenied =
    lastDeniedAtMs !== null && nowMs - lastDeniedAtMs <= deniedLookbackMs

  await logSuspiciousPresence({
    organizationId,
    boxId,
    durationSec: Math.floor(durationMs / 1000),
    distanceCm,
    motion,
    lastDeniedUid: recentDenied ? securityState.lastDeniedUid || null : null,
    lastDeniedReason: recentDenied ? securityState.lastDeniedReason || null : null,
    payload,
  })

  await updateBoxById(boxId, {
    securityState: {
      ...securityState,
      lastPresenceDistanceCm: distanceCm,
      lastSuspiciousLoggedAt: new Date(),
    },
  })
}

async function resolveActivityOrganizationId(type, entityId) {
  if (type === 'box') {
    const box = await getBoxById(entityId)
    return box?.organizationId || null
  }

  if (type === 'device') {
    const device = await getDeviceById(entityId)
    return device?.organizationId || null
  }

  return null
}

async function recordBoxStatus(boxId, payload) {
  const cachedBox = getCachedEntity(boxCache, boxId)
  const box = cachedBox || await getBoxById(boxId)
  if (box) {
    setCachedEntity(boxCache, boxId, box)
  }

  if (box) {
    const snapshot = deriveConnectivityState(payload, box)
    const fingerprint = buildStatusFingerprint(snapshot, payload)
    const persist = shouldPersistStatus(`box:${boxId}`, fingerprint)

    if (!persist) {
      return {
        skipped: true,
        boxId,
      }
    }

    const activity = await upsertActivity({
      type: 'box',
      entityId: boxId,
      activityType: 'status',
      organizationId: box.organizationId || null,
      payload,
    })

    const updatedBox = await updateBoxById(boxId, {
      status: snapshot.status,
      statusOverride: box.statusOverride || null,
      lastSeenAt: FieldValue.serverTimestamp(),
      connectivity: {
        ...snapshot.connectivity,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      lastStatusPayload: payload,
    })
    if (updatedBox) {
      setCachedEntity(boxCache, boxId, updatedBox)
    }

    await evaluateSuspiciousPresence(box, payload)
    return activity
  }

  return null
}

async function recordBoxSessions(boxId, payload) {
  const fingerprint = JSON.stringify({
    count: toNullableNumber(payload?.count),
    items: Array.isArray(payload?.items) ? payload.items : [],
  })
  const persist = shouldPersistStatus(`box-sessions:${boxId}`, fingerprint)
  if (!persist) {
    return {
      skipped: true,
      boxId,
    }
  }

  return upsertActivity({
    type: 'box',
    entityId: boxId,
    activityType: 'sessions',
    organizationId: await resolveActivityOrganizationId('box', boxId),
    payload,
  })
}

async function recordDeviceStatus(deviceId, payload) {
  const cachedDevice = getCachedEntity(deviceCache, deviceId)
  const device = cachedDevice || await getDeviceById(deviceId)
  if (device) {
    setCachedEntity(deviceCache, deviceId, device)
  }

  if (device) {
    const snapshot = deriveConnectivityState(payload, device)
    const fingerprint = buildStatusFingerprint(snapshot, payload)
    const persist = shouldPersistStatus(`device:${deviceId}`, fingerprint)

    if (!persist) {
      return {
        skipped: true,
        deviceId,
      }
    }

    const activity = await upsertActivity({
      type: 'device',
      entityId: deviceId,
      activityType: 'status',
      organizationId: device.organizationId || null,
      payload,
    })

    const updatedDevice = await updateDeviceById(deviceId, {
      status: snapshot.status,
      statusOverride: device.statusOverride || null,
      lastSeenAt: FieldValue.serverTimestamp(),
      connectivity: {
        ...snapshot.connectivity,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      lastStatusPayload: payload,
    })
    if (updatedDevice) {
      setCachedEntity(deviceCache, deviceId, updatedDevice)
    }

    return activity
  }

  return null
}

async function recordDeviceFanState(deviceId, payload) {
  return upsertActivity({
    type: 'device',
    entityId: deviceId,
    activityType: 'fan',
    organizationId: await resolveActivityOrganizationId('device', deviceId),
    payload,
  })
}

async function getActivities(filters = {}) {
  return listActivities(filters)
}

async function getActivity(docId) {
  return getActivityByDocId(docId)
}

module.exports = {
  recordBoxStatus,
  recordBoxSessions,
  recordDeviceStatus,
  recordDeviceFanState,
  getActivities,
  getActivity,
}
