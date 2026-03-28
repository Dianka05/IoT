const { v4: uuidv4 } = require('uuid')

function buildMessage(source, kind, name, payload) {
    const uuid = uuidv4()
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