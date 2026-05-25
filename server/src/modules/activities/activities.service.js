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
      connectivity: snapshot.connectivity,
      lastStatusPayload: payload,
    })
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
      connectivity: snapshot.connectivity,
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
