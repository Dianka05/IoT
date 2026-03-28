const { publishDeviceCommand } = require('../../../mqtt/publishers')

function publishFanSet(deviceId, enabled, sessionId) {
  return publishDeviceCommand(deviceId, 'fan_set', {
    enabled,
    sessionId,
    requestedBy: 'backend',
  })
}

module.exports = {
  publishFanSet,
}
