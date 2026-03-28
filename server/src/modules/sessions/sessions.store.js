const sessionsById = new Map()
const deviceOccupancy = new Map()

function createSession(session) {
  sessionsById.set(session.sessionId, session)

  for (const deviceId of session.deviceIds || []) {
    deviceOccupancy.set(deviceId, session.sessionId)
  }

  return session
}

function endSession(sessionId) {
  const session = sessionsById.get(sessionId)
  if (!session) return null

  for (const deviceId of session.deviceIds || []) {
    const occupiedBy = deviceOccupancy.get(deviceId)
    if (occupiedBy === sessionId) {
      deviceOccupancy.delete(deviceId)
    }
  }

  session.status = 'ended'
  sessionsById.set(sessionId, session)
  return session
}

function isDeviceBusy(deviceId) {
  return deviceOccupancy.has(deviceId)
}

function getSession(sessionId) {
  return sessionsById.get(sessionId) || null
}

module.exports = {
  createSession,
  endSession,
  isDeviceBusy,
  getSession,
}
