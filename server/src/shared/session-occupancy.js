const { listSessionsByOrganization } = require('../modules/sessions/sessions.store.firestore')

const ACTIVE_STATUSES = new Set(['pending', 'active'])

function getPriority(status) {
  return status === 'active' ? 2 : status === 'pending' ? 1 : 0
}

async function buildOccupancyMaps(organizationId, limit = 500) {
  if (!organizationId) {
    return {
      byDeviceId: new Map(),
      byBoxId: new Map(),
    }
  }

  const sessions = await listSessionsByOrganization(organizationId, limit)
  const byDeviceId = new Map()
  const byBoxId = new Map()

  sessions.forEach((session) => {
    const status = String(session.status || '').toLowerCase()
    if (!ACTIVE_STATUSES.has(status)) {
      return
    }

    const occupancy = {
      sessionId: session.sessionId || session.id || null,
      status,
      userId: session.userId || null,
      userName: session.userName || null,
      uid: session.uid || null,
      boxId: session.boxId || null,
      deviceIds: Array.isArray(session.deviceIds) ? session.deviceIds : [],
    }

    const currentBox = byBoxId.get(session.boxId)
    if (!currentBox || getPriority(status) > getPriority(currentBox.status)) {
      byBoxId.set(session.boxId, occupancy)
    }

    occupancy.deviceIds.forEach((deviceId) => {
      const currentDevice = byDeviceId.get(deviceId)
      if (!currentDevice || getPriority(status) > getPriority(currentDevice.status)) {
        byDeviceId.set(deviceId, occupancy)
      }
    })
  })

  return {
    byDeviceId,
    byBoxId,
  }
}

module.exports = {
  buildOccupancyMaps,
}
