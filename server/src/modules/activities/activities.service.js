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
  const activity = await upsertActivity({
    type: 'box',
    entityId: boxId,
    activityType: 'status',
    organizationId: await resolveActivityOrganizationId('box', boxId),
    payload,
  })

  const box = await getBoxById(boxId)
  if (box) {
    const snapshot = deriveConnectivityState(payload, box)

    await updateBoxById(boxId, {
      status: snapshot.status,
      statusOverride: box.statusOverride || null,
      lastSeenAt: FieldValue.serverTimestamp(),
      connectivity: {
        ...snapshot.connectivity,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      lastStatusPayload: payload,
    })

    await evaluateSuspiciousPresence(box, payload)
  }

  return activity
}

async function recordBoxSessions(boxId, payload) {
  return upsertActivity({
    type: 'box',
    entityId: boxId,
    activityType: 'sessions',
    organizationId: await resolveActivityOrganizationId('box', boxId),
    payload,
  })
}

async function recordDeviceStatus(deviceId, payload) {
  const activity = await upsertActivity({
    type: 'device',
    entityId: deviceId,
    activityType: 'status',
    organizationId: await resolveActivityOrganizationId('device', deviceId),
    payload,
  })

  const device = await getDeviceById(deviceId)
  if (device) {
    const snapshot = deriveConnectivityState(payload, device)

    await updateDeviceById(deviceId, {
      status: snapshot.status,
      statusOverride: device.statusOverride || null,
      lastSeenAt: FieldValue.serverTimestamp(),
      connectivity: {
        ...snapshot.connectivity,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      lastStatusPayload: payload,
    })
  }

  return activity
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
