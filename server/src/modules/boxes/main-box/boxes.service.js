const { publishBoxCommand } = require('../../../mqtt/publishers')
const { MAIN_BOX_1 } = require('../../../shared/constants')

function publishAuthResult(boxId, payload) {
  const {
    uid,
    allowed,
    userId,
    userName,
    sessionId,
    deviceIds,
    role,
    sessionDurationSec,
    mode,
    reason,
  } = payload

  return publishBoxCommand(boxId, MAIN_BOX_1.AUTH_RESULT_COMMAND, {
    uid,
    allowed,
    userId,
    userName,
    sessionId,
    deviceIds,
    role,
    sessionDurationSec,
    mode,
    reason,
  })
}

function publishEndSession(boxId, payload) {
  const { reason, sessionId } = payload

  return publishBoxCommand(boxId, MAIN_BOX_1.END_SESSION_COMMAND, {
    reason,
    sessionId,
  })
}

module.exports = {
  publishAuthResult,
  publishEndSession,
}
