const {
  logInfo,
  Errors,
} = require('ds-express-errors')
const express = require('express')
const { publishFanSet } = require('./device.service')
const client = require('../../../mqtt/client')
const { sendSuccessResponse } = require('../../../responses/default.response')
const router = express.Router()


/**
 * @swagger
 * /fan:
 *   post:
 *     summary: Set fan state
 *     tags:
 *       - Device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FanSetRequest'
 *     responses:
 *       200:
 *         description: Fan command sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FanSetSuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: MQTT broker is not connected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

    if (!deviceId || typeof deviceId !== 'string') {
      return next(Errors.BadRequest('`deviceId` must be a non-empty string'))
    }

    publishFanSet(deviceId, enabled, sessionId)

    sendSuccessResponse(res, enabled)
   
  } catch (error) {
    next(error)
  }
})

module.exports = router
