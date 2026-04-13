const mqtt = require('mqtt')
const { logInfo, logError, logWarning } = require('ds-express-errors')
require('dotenv').config()

const BROKER_URL = process.env.BROKER_URL || false;

function createDisabledClient(reason) {
  return {
    connected: false,
    disabled: true,
    reason,
    publish(topic, payload, options, callback) {
      if (typeof options === 'function') callback = options
      if (callback) callback(new Error(reason))
    },
    subscribe(topics, options, callback) {
      if (typeof options === 'function') callback = options
      if (callback) callback(new Error(reason))
    },
    on() {},
  }
}

if (BROKER_URL === false) {
  const reason = 'BROKER_URL is not configured'

  logWarning(reason)
  module.exports = createDisabledClient(reason)
  return
}

const options = {
  clientId: process.env.MQTT_CLIENT_ID || 'backend-express',
  // reconnectPeriod: 3000,
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT || 8883,
  protocol: 'mqtts',
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
}
const client = mqtt.connect(BROKER_URL, options)
// const client = mqtt.connect(BROKER_URL, {
//   clientId: process.env.MQTT_CLIENT_ID || 'backend-express',
//   reconnectPeriod: 3000,
// })

client.on('connect', () => {
  logInfo('Connected to MQTT broker')
})

client.on('reconnect', () => {
  logInfo('Reconnecting to MQTT...')
})

client.on('error', (err) => {
  logError('MQTT error: ' + err)
})

module.exports = client
