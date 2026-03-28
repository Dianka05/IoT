const { logDebug } = require('ds-express-errors')
const client = require('./client')
const { handleMqttMessage } = require('./handlers')

function initMqtt() {
  if (client.disabled) {
    logDebug('MQTT init skipped: ' + client.reason)
    return
  }

  client.on('connect', () => {
    client.subscribe(
      ['device/+/state/+', 'box/+/state/+', 'device/+/event/+', 'box/+/event/+'],
      { qos: 1 },
    )
  })

  client.on('message', handleMqttMessage)
}

module.exports = { initMqtt }
