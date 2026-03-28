const { logWarning } = require('ds-express-errors')

function publishFanSet(deviceId, enabled, sessionId) {
  logWarning(
    '[MOCK DEVICE] fan_set -> ' +
      JSON.stringify({ deviceId, enabled, sessionId }),
  )

  return {
    success: true,
    mocked: true,
    deviceId,
    enabled,
    sessionId,
  }
}

module.exports = {
  publishFanSet,
}
