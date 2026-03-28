const isMock =
  process.env.NODE_ENV === 'test'

module.exports = isMock
  ? require('./mock-device.provider')
  : require('./mqtt-device.provider')
