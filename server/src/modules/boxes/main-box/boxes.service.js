const { publishBoxCommand } = require('../../../mqtt/publishers')
const { MAIN_BOX_1 } = require('../../../shared/constants')
const {
  createBox,
  getBoxById,
  listBoxes,
  listBoxesByOrganization,
  updateBoxById,
  deleteBoxById,
} = require('./boxes.store.firestore')
const { getDeviceById } = require('../../devices/fan-1/devices.store.firestore')
const { getAccessibleOrganizationIds } = require('../../users/users.service')
const { applyConnectivityFreshness } = require('../../../shared/connectivity-state')
const { buildOccupancyMaps } = require('../../../shared/session-occupancy')

function publishAuthResult(boxId, payload) {
  const {
    uid,
    allowed,
    userId,
    userName,
    sessionId,
    deviceIds,
    role,
    sessionDurationSec,
    mode,
    reason,
  } = payload

  return publishBoxCommand(boxId, MAIN_BOX_1.AUTH_RESULT_COMMAND, {
    uid,
    allowed,
    userId,
    userName,
    sessionId,
    deviceIds,
    role,
    sessionDurationSec,
    mode,
    reason,
  })
}

function publishEndSession(boxId, payload) {
  const { reason, sessionId } = payload

  return publishBoxCommand(boxId, MAIN_BOX_1.END_SESSION_COMMAND, {
    reason,
    sessionId,
  })
}

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

async function assertDevicesBelongToOrganization(deviceIds = [], organizationId) {
  for (const deviceId of deviceIds) {
    const device = await getDeviceById(deviceId)

    if (!device) {
      throw new Error(`DEVICE_NOT_FOUND:${deviceId}`)
    }

    if (device.organizationId !== organizationId) {
      throw new Error(`DEVICE_OUTSIDE_ORGANIZATION:${deviceId}`)
    }
  }
}

async function addBox(userProfile, data) {
  const organizationId = resolveTargetOrganizationId(
    userProfile,
    data.organizationId || null
  )
  const deviceIds = Array.isArray(data.deviceIds) ? data.deviceIds : []

  await assertDevicesBelongToOrganization(deviceIds, organizationId)

  return createBox({
    boxId: data.boxId,
    name: data.name,
    location: data.location || null,
    active: data.active ?? true,
    status: data.status || 'offline',
    statusOverride:
      data.active === false
        ? 'offline'
        : String(data.status || '').trim().toLowerCase() === 'maintenance'
          ? 'maintenance'
          : null,
    deviceIds,
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

async function getBoxesForOrganization(organizationId, limit = 50) {
  const items = await listBoxesByOrganization(organizationId, limit)

  return items.map((item) => applyConnectivityFreshness(item))
}

async function getBoxes(limit = 50) {
  const items = await listBoxes(limit)
  return items.map((item) => applyConnectivityFreshness(item))
}

async function getBox(boxId) {
  const item = await getBoxById(boxId)
  if (!item) return null

  return applyConnectivityFreshness(item)
}

async function patchBox(userProfile, boxId, patch) {
  const current = await getBoxById(boxId)
  if (!current) return null

  if (current.organizationId !== userProfile.currentOrganizationId) {
    throw new Error('ORGANIZATION_ACCESS_DENIED')
  }

  if (patch.deviceIds !== undefined) {
    await assertDevicesBelongToOrganization(
      Array.isArray(patch.deviceIds) ? patch.deviceIds : [],
      current.organizationId
    )
  }

  const updated = await updateBoxById(boxId, applyManualStatusPatch(current, patch))
  return updated ? applyConnectivityFreshness(updated) : null
}

async function removeBox(userProfile, boxId) {
  const current = await getBoxById(boxId)
  if (!current) return false

  if (current.organizationId !== userProfile.currentOrganizationId) {
    throw new Error('ORGANIZATION_ACCESS_DENIED')
  }

  return deleteBoxById(boxId)
}

module.exports = {
  publishAuthResult,
  publishEndSession,
  addBox,
  getBoxes,
  getBoxesForOrganization,
  getBox,
  patchBox,
  removeBox,
}
