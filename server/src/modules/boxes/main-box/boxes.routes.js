const express = require('express')
const router = express.Router()
const client = require('../../../mqtt/client')
const { Errors } = require('ds-express-errors')
const { publishAuthResult, publishEndSession } = require('./boxes.service')
const { sendSuccessResponse } = require('../../../responses/default.response')
const {
  addBox,
  getBoxes,
  getBox,
  patchBox,
  removeBox,
} = require('./boxes.service')

/**
 * @swagger
 * /boxes:
 *   post:
 *     summary: Create box
 *     tags:
 *       - Boxes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boxId
 *               - name
 *             properties:
 *               boxId:
 *                 type: string
 *                 example: main-1
 *               name:
 *                 type: string
 *                 example: Main Box 1
 *               location:
 *                 type: string
 *                 nullable: true
 *                 example: Lab A
 *               active:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 example: offline
 *               deviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [fan-1]
 *     responses:
 *       200:
 *         description: Box created successfully
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
 *       409:
 *         description: Box already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/boxes', async (req, res, next) => {
  try {
    const { boxId, name, location, active, status, deviceIds } = req.body || {}

    if (!boxId || typeof boxId !== 'string') {
      return next(Errors.BadRequest('`boxId` must be a non-empty string'))
    }

    if (!name || typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a non-empty string'))
    }

    if (deviceIds && !Array.isArray(deviceIds)) {
      return next(Errors.BadRequest('`deviceIds` must be an array'))
    }

    const item = await addBox({
      boxId,
      name,
      location,
      active,
      status,
      deviceIds,
    })
    sendSuccessResponse(res, item)
  } catch (err) {
    if (err.message === 'BOX_ALREADY_EXISTS') {
      return next(Errors.Conflict('Box already exists'))
    }

    next(err)
  }
})

/**
 * @swagger
 * /boxes:
 *   get:
 *     summary: Get boxes
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Number of boxes to return
 *     responses:
 *       200:
 *         description: Boxes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoxList'
 */
router.get('/boxes', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getBoxes(limit)

    sendSuccessResponse(res, {
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /boxes/{boxId}:
 *   get:
 *     summary: Get box by id
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: boxId
 *         required: true
 *         schema:
 *           type: string
 *         description: Box identifier
 *     responses:
 *       200:
 *         description: Box fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
 *       404:
 *         description: Box not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/boxes/:boxId', async (req, res, next) => {
  try {
    const item = await getBox(req.params.boxId)

    if (!item) {
      return next(Errors.NotFound('Box not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /boxes/{boxId}:
 *   patch:
 *     summary: Update box
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *                 nullable: true
 *               active:
 *                 type: boolean
 *               status:
 *                 type: string
 *               deviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Box updated successfully
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
 *       404:
 *         description: Box not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/boxes/:boxId', async (req, res, next) => {
  try {
    const { boxId } = req.params
    const { name, location, active, status, deviceIds } = req.body || {}

    const patch = {}

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return next(Errors.BadRequest('`name` must be a string'))
      }
      patch.name = name
    }

    if (location !== undefined) {
      if (location !== null && typeof location !== 'string') {
        return next(Errors.BadRequest('`location` must be a string or null'))
      }
      patch.location = location
    }

    if (active !== undefined) {
      if (typeof active !== 'boolean') {
        return next(Errors.BadRequest('`active` must be boolean'))
      }
      patch.active = active
    }

    if (status !== undefined) {
      if (typeof status !== 'string') {
        return next(Errors.BadRequest('`status` must be a string'))
      }
      patch.status = status
    }

    if (deviceIds !== undefined) {
      if (!Array.isArray(deviceIds)) {
        return next(Errors.BadRequest('`deviceIds` must be an array'))
      }
      patch.deviceIds = deviceIds
    }

    const item = await patchBox(boxId, patch)

    if (!item) {
      return next(Errors.NotFound('Box not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /boxes/{boxId}:
 *   delete:
 *     summary: Delete box
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: boxId
 *         required: true
 *         schema:
 *           type: string
 *         description: Box identifier
 *     responses:
 *       200:
 *         description: Box deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Box not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/boxes/:boxId', async (req, res, next) => {
  try {
    const { boxId } = req.params

    const deleted = await removeBox(boxId)

    if (!deleted) {
      return next(Errors.NotFound('Box not found'))
    }

    sendSuccessResponse(res, {
      deleted: true,
      id: boxId,
    })
  } catch (err) {
    next(err)
  }
})


// ------------------------------------------

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
