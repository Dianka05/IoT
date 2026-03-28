const client = require('./client')
const buildMessage = require('./builder')
const topics = require('./topics')
const { logError } = require('ds-express-errors')

function publishBoxCommand(boxId, commandName, payload) {
  const topic = topics.boxCommand(boxId, commandName)
  const message = buildMessage('backend', 'command', commandName, payload)

  client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
    if (err) {
      logError('Publish error: ' + err)
      return
    }

    console.log('Published box command:', message)
  })
}

function publishDeviceCommand(deviceId, commandName, payload) {
  const topic = topics.deviceCommand(deviceId, commandName)
  const message = buildMessage('backend', 'command', commandName, payload)

  client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
    if (err) {
      logError('Publish error: ' + err)
      return
    }

    console.log('Published device command:', message)
  })
}

module.exports = {
  publishBoxCommand,
  publishDeviceCommand,
}
