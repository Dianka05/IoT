const express = require('express')
const router = express.Router()
const client = require('../../../mqtt/client')
const { Errors } = require('ds-express-errors')
const { publishAuthResult, publishEndSession } = require('./boxes.service')
const { sendSuccessResponse } = require('../../../responses/default.response')


/**
 * @swagger
 * /boxes/{boxId}/auth-result:
 *   post:
 *     summary: Send auth result to box
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: boxId
 *         required: true
 *         schema:
 *           type: string
 *         description: Box identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxAuthResultRequest'
 *     responses:
 *       200:
 *         description: Auth result sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
router.post('/boxes/:boxId/auth-result', (req, res, next) => {
  try {
    const { boxId } = req.params
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

    const info = {
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
      }

    sendSuccessResponse(res, info)

    
  } catch (error) {
    next(error)
  }
})


/**
 * @swagger
 * /boxes/{boxId}/end-session:
 *   post:
 *     summary: End active box session
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: boxId
 *         required: true
 *         schema:
 *           type: string
 *         description: Box identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxEndSessionRequest'
 *     responses:
 *       200:
 *         description: Session end message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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

    const info = {
      boxId,
      reason,
      sessionId
    }

    sendSuccessResponse(res, info)

  } catch (error) {
    next(error)
  }
})

module.exports = router
