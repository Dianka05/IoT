const express = require('express')
const router = express.Router()
const client = require('../../../mqtt/client')
const { Errors } = require('ds-express-errors')
const { publishAuthResult, publishEndSession } = require('./boxes.service')

router.post('/boxes/:boxId/auth-result', (req, res, next) => {
  try {
    const { boxId } = req.params
    console.log("Boxid: ", boxId)
    const { uid, allowed, userId, userName, deviceIds, sessionId, role, sessionDurationSec, mode, reason } = req.body

    if (!uid || typeof uid !== 'string') {
      return next(Errors.BadRequest('`uid` must be a non-empty string'))
    }

    if (typeof allowed !== 'boolean') {
      return next(Errors.BadRequest('`allowed` must be boolean'))
    }

    if (allowed) {
      if (!sessionId || typeof sessionId !== 'string') {
        return next(Errors.BadRequest('`sessionId` must be a non-empty string when `allowed=true`'))
      }

      if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
        return next(Errors.BadRequest('`deviceIds` must be a non-empty array when `allowed=true`'))
      }
    }


    if (!client.connected) {
      return next(Errors.ServiceUnavailable('MQTT broker is not connected'))
    }

    publishAuthResult(boxId, {
      uid,
      allowed,
      userId,
      userName,
      role,
      sessionId,
      deviceIds,
      sessionDurationSec,
      mode,
      reason,
    })

    res.json({
      success: true,
      sent: true,
      info: {
        sessionId,
        uid,
        allowed,
        userId,
        userName,
        role,
        deviceIds,
        sessionDurationSec,
        mode,
        reason,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/boxes/:boxId/end-session', (req, res, next) => {

  try {
    const { boxId } = req.params
    const { reason, sessionId } = req.body

    if (!sessionId || typeof sessionId !== 'string') {
      return next(Errors.BadRequest('`sessionId` must be a non-empty string'))
    }

    if (!client.connected) {
      return next(Errors.ServiceUnavailable('MQTT broker is not connected'))  
    }

    publishEndSession(boxId, { reason, sessionId })

    res.json({
      success: true,
      sent: true,
      info: {
        boxId,
        reason,
        sessionId
      },
    })

  } catch (error) {
    next(error)
  }
})

module.exports = router
