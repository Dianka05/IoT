const { publishBoxCommand } = require('../../../mqtt/publishers')
const { MAIN_BOX_1 } = require('../../../shared/constants')

const {
  createBox,
  getBoxById,
  listBoxes,
  updateBoxById,
  deleteBoxById,
} = require('./boxes.store.firestore')

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

// ----------------------------
async function addBox(data) {
  return createBox({
    boxId: data.boxId,
    name: data.name,
    location: data.location || null,
    active: data.active ?? true,
    status: data.status || 'offline',
    deviceIds: Array.isArray(data.deviceIds) ? data.deviceIds : [],
  })
}

async function getBoxes(limit = 50) {
  return listBoxes(limit)
}

async function getBox(boxId) {
  return getBoxById(boxId)
}

async function patchBox(boxId, patch) {
  return updateBoxById(boxId, patch)
}

async function removeBox(boxId) {
  return deleteBoxById(boxId)
}

module.exports = {
  publishAuthResult,
  publishEndSession,
  addBox,
  getBoxes,
  getBox,
  patchBox,
  removeBox,
}
