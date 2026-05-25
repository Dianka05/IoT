const { publishDeviceCommand } = require('../../../mqtt/publishers')
const {
  createDevice,
  getDeviceById,
  listDevices,
  listDevicesByOrganization,
  updateDeviceById,
  deleteDeviceById,
} = require('./devices.store.firestore')
const { getBoxById } = require('../../boxes/main-box/boxes.store.firestore')
const { getAccessibleOrganizationIds } = require('../../users/users.service')
const { applyConnectivityFreshness } = require('../../../shared/connectivity-state')
const { buildOccupancyMaps } = require('../../../shared/session-occupancy')

function resolveTargetOrganizationId(userProfile, requestedOrganizationId = null) {
  if (requestedOrganizationId) {
    if (!getAccessibleOrganizationIds(userProfile).includes(requestedOrganizationId)) {
      throw new Error('ORGANIZATION_ACCESS_DENIED')
    }

    return requestedOrganizationId
  }

  if (!userProfile.currentOrganizationId) {
    throw new Error('CURRENT_ORGANIZATION_NOT_SET')
  }

  return userProfile.currentOrganizationId
}

async function assertBoxBelongsToOrganization(boxId, organizationId) {
  if (!boxId) return null

  const box = await getBoxById(boxId)
  if (!box) {
    throw new Error('BOX_NOT_FOUND')
  }

  if (box.organizationId !== organizationId) {
    throw new Error('BOX_OUTSIDE_ORGANIZATION')
  }

  return box
}

async function addDevice(userProfile, data) {
  const organizationId = resolveTargetOrganizationId(
    userProfile,
    data.organizationId || null
  )

  await assertBoxBelongsToOrganization(data.boxId || null, organizationId)

  return createDevice({
    deviceId: data.deviceId,
    name: data.name,
    type: data.type,
    boxId: data.boxId || null,
    active: data.active ?? true,
    status: data.status || 'idle',
    statusOverride:
      data.active === false
        ? 'offline'
        : String(data.status || '').trim().toLowerCase() === 'maintenance'
          ? 'maintenance'
          : null,
    metadata: data.metadata || {},
    organizationId,
  })
}

function applyManualStatusPatch(current, patch = {}) {
  const next = { ...patch }
  const nextActive =
    patch.active !== undefined ? patch.active : current.active !== false
  const requestedStatus =
    patch.status !== undefined
      ? String(patch.status || '').trim().toLowerCase()
      : null

  if (nextActive === false) {
    next.active = false
    next.status = 'offline'
    next.statusOverride = 'offline'
    return next
  }

  if (requestedStatus === 'maintenance') {
    next.status = 'maintenance'
    next.statusOverride = 'maintenance'
    return next
  }

  if (patch.active === true || patch.status !== undefined) {
    next.statusOverride = null
  }

  return next
}

async function getDevicesForOrganization(organizationId, limit = 50) {
  const items = await listDevicesByOrganization(organizationId, limit)
  const occupancy = await buildOccupancyMaps(organizationId)

  return Promise.all(items.map(async (item) => {
    const deviceId = item.deviceId || item.id
    const box = item.boxId ? await getBoxById(item.boxId) : null
    const freshBox = box ? applyConnectivityFreshness(box) : null

    return applyConnectivityFreshness({
      ...item,
      boxState: freshBox
        ? {
            boxId: freshBox.boxId || freshBox.id || null,
            status: freshBox.status || 'offline',
            active: freshBox.active !== false,
          }
        : null,
      occupancy: occupancy.byDeviceId.get(deviceId) || null,
    })
  }))
}

async function getDevices(limit = 50) {
  const items = await listDevices(limit)
  return items.map((item) => applyConnectivityFreshness(item))
}

async function getDevice(deviceId) {
  const item = await getDeviceById(deviceId)
  if (!item) return null

  const occupancy = await buildOccupancyMaps(item.organizationId)
  const box = item.boxId ? await getBoxById(item.boxId) : null
  const freshBox = box ? applyConnectivityFreshness(box) : null
  return applyConnectivityFreshness({
    ...item,
    boxState: freshBox
      ? {
          boxId: freshBox.boxId || freshBox.id || null,
          status: freshBox.status || 'offline',
          active: freshBox.active !== false,
        }
      : null,
    occupancy: occupancy.byDeviceId.get(deviceId) || null,
  })
}

async function patchDevice(userProfile, deviceId, patch) {
  const current = await getDeviceById(deviceId)
  if (!current) return null

  if (current.organizationId !== userProfile.currentOrganizationId) {
    throw new Error('ORGANIZATION_ACCESS_DENIED')
  }

  if (patch.boxId !== undefined) {
    await assertBoxBelongsToOrganization(patch.boxId, current.organizationId)
  }

  const updated = await updateDeviceById(deviceId, applyManualStatusPatch(current, patch))
  return updated ? applyConnectivityFreshness(updated) : null
}

async function removeDevice(userProfile, deviceId) {
  const current = await getDeviceById(deviceId)
  if (!current) return false

  if (current.organizationId !== userProfile.currentOrganizationId) {
    throw new Error('ORGANIZATION_ACCESS_DENIED')
  }

  return deleteDeviceById(deviceId)
}

function publishFanSet(deviceId, enabled, sessionId) {
  return publishDeviceCommand(deviceId, 'fan_set', {
    enabled,
    sessionId,
    requestedBy: 'backend',
  })
}

function publishDeviceAccessSet(deviceId, enabled, sessionId, durationSec) {
  return publishDeviceCommand(deviceId, 'access_set', {
    enabled,
    sessionId,
    durationSec,
    requestedBy: 'backend',
  })
}

function publishDeviceEndSession(deviceId, reason) {
  return publishDeviceCommand(deviceId, 'end_session', {
    reason,
    requestedBy: 'backend',
  })
}

module.exports = {
  addDevice,
  getDevices,
  getDevicesForOrganization,
  getDevice,
  patchDevice,
  removeDevice,
  publishFanSet,
  publishDeviceAccessSet,
  publishDeviceEndSession,
}
