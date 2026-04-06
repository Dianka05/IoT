const sessionsService = require('../modules/sessions/sessions.service')

function parseTopic(topic) {
  const parts = topic.split('/')

  if (parts.length !== 4) return null

  const [entityType, entityId, channelType, name] = parts
  return { entityType, entityId, channelType, name }
}

async function handleMqttMessage(topic, messageBuffer) {
  try {
    const msg = JSON.parse(messageBuffer.toString())
    const parsed = parseTopic(topic)

    if (!parsed) return

    const { entityType, entityId, channelType, name } = parsed

    if (entityType === 'device' && channelType === 'state' && name === 'fan') {
      return handleFanState(entityId, msg)
    }

    if (entityType === 'device' && channelType === 'state' && name === 'status') {
      return handleDeviceStatus(entityId, msg)
    }

    if (entityType === 'box' && channelType === 'state' && name === 'status') {
      return handleBoxStatus(entityId, msg)
    }

    if (entityType === 'box' && channelType === 'event' && name === 'auth_request') {
      return await sessionsService.handleAuthRequest({
        ...msg,
        payload: {
          ...msg.payload,
          boxId: msg.payload.boxId || entityId,
        },
      })
    }

    if (entityType === 'box' && channelType === 'event' && name === 'session_started') {
      return await sessionsService.handleSessionStarted(msg)
    }

    if (entityType === 'box' && channelType === 'event' && name === 'session_ended') {
      return await sessionsService.handleSessionEnded(msg)
    }

    if (entityType === 'box' && channelType === 'state' && name === 'sessions') {
      return await sessionsService.handleSessionsState(msg)
    }
  } catch (err) {
    console.error('MQTT handler error:', err)
  }
}

function handleFanState(deviceId, msg) {
  console.log(`Fan state updated [${deviceId}]:`, msg.payload)
}

function handleDeviceStatus(deviceId, msg) {
  console.log(`Device status updated [${deviceId}]:`, msg.payload)
}

function handleBoxStatus(boxId, msg) {
  console.log(`Box status updated [${boxId}]:`, msg.payload)
}

module.exports = {
  handleMqttMessage,
}
