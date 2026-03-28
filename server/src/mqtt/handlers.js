const sessionsService = require('../modules/sessions/sessions.service')

function parseTopic(topic) {
  const parts = topic.split('/')

  if (parts.length !== 4) return null

  const [entityType, entityId, channelType, name] = parts
  return { entityType, entityId, channelType, name }
}

function handleMqttMessage(topic, messageBuffer) {
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
      return sessionsService.handleAuthRequest({
        ...msg,
        payload: {
          ...msg.payload,
          boxId: msg.payload.boxId || entityId,
        },
      })
    }

    if (entityType === 'box' && channelType === 'event' && name === 'session_started') {
      return sessionsService.handleSessionStarted(msg)
    }

    if (entityType === 'box' && channelType === 'event' && name === 'session_ended') {
      return sessionsService.handleSessionEnded(msg)
    }

    if (entityType === 'box' && channelType === 'state' && name === 'sessions') {
      return sessionsService.handleSessionsState(msg)
    }
  } catch (err) {
    // log
  }
}

module.exports = {
  handleMqttMessage,
}
