const { publishFanSet } = require('../modules/devices/fan-1/device.service')

function publishFanSetToDevice(deviceId, enabled, sessionId) {
  return publishFanSet(deviceId, enabled, sessionId)
}

module.exports = {
  publishFanSet: publishFanSetToDevice,
}
