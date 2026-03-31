const {
  logInfo,
  Errors,
} = require('ds-express-errors')
const express = require('express')
const { publishFanSet } = require('./device.service')
const client = require('../../../mqtt/client')
const router = express.Router()

router.post('/fan', (req, res, next) => {
  try {
    const { enabled, sessionId, deviceId } = req.body
    

    logInfo('HTTP POST /fan called with: ' + JSON.stringify(req.body))

    if (typeof enabled !== 'boolean') {
      return next(Errors.BadRequest('`enabled` must be boolean'))
    }

    if (!client.connected) {
      return next(Errors.ServiceUnavailable('MQTT broker is not connected'))
    }

    publishFanSet(deviceId, enabled, sessionId)

    res.json({
      success: true,
      sent: true,
      enabled,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
