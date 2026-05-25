const { randomUUID } = require('crypto')

function buildMessage(source, kind, name, payload) {
    const uuid = randomUUID()
    return {
        messageId: uuid,
        timestamp: Date.now(),
        source,
        kind,
        name,
        payload,
    }
}

module.exports = buildMessage
