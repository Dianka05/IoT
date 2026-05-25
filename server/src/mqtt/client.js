const mqtt = require('mqtt')
const { logInfo, logError, logWarning } = require('ds-express-errors')
require('dotenv').config()

const BROKER_URL = process.env.BROKER_URL || false
const MQTT_PROTOCOL = process.env.MQTT_PROTOCOL || 'mqtts'
const MQTT_HOST = process.env.MQTT_HOST
const MQTT_PORT = process.env.MQTT_PORT || 8883
const CLIENT_ID_BASE = process.env.MQTT_CLIENT_ID || 'backend-express'
const CLIENT_ID = process.env.NODE_ENV === 'production'
  ? CLIENT_ID_BASE
  : `${CLIENT_ID_BASE}-${process.env.PORT || process.pid}`
const SHOULD_DISABLE_MQTT =
  process.env.DISABLE_MQTT === 'true' ||
  process.env.VERCEL === '1'

function resolveBrokerUrl() {
  if (MQTT_HOST) {
    return `${MQTT_PROTOCOL}://${MQTT_HOST}:${MQTT_PORT}`
  }

  return BROKER_URL
}

const resolvedBrokerUrl = resolveBrokerUrl()

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

if (SHOULD_DISABLE_MQTT || !resolvedBrokerUrl) {
  const reason = SHOULD_DISABLE_MQTT
    ? 'MQTT is disabled in the current runtime'
    : 'MQTT broker connection is not configured'

  logWarning(reason)
  module.exports = createDisabledClient(reason)
  return
}

const options = {
  clientId: CLIENT_ID,
  reconnectPeriod: 3000,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
}
const client = mqtt.connect(resolvedBrokerUrl, options)

client.on('connect', () => {
  logInfo(`Connected to MQTT broker (${resolvedBrokerUrl}) as ${CLIENT_ID}`)
})

client.on('reconnect', () => {
  logInfo(`Reconnecting to MQTT as ${CLIENT_ID}...`)
})

client.on('close', () => {
  logWarning(`MQTT connection closed for ${CLIENT_ID}`)
})

client.on('error', (err) => {
  logError('MQTT error: ' + err)
})

module.exports = client
