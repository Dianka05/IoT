const {
  logInfo,
  Errors,
} = require('ds-express-errors')
const express = require('express')
const { publishFanSet, addDevice,
  getDevices,
  getDevice,
  patchDevice,
  removeDevice, } = require('./device.service')
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

// ----------------------------

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Create device
 *     tags:
 *       - Devices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - name
 *               - type
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: fan-1
 *               name:
 *                 type: string
 *                 example: Fan 1
 *               type:
 *                 type: string
 *                 example: fan
 *               boxId:
 *                 type: string
 *                 nullable: true
 *                 example: main-1
 *               active:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 example: idle
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Device created successfully
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
 *         description: Device already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/devices', async (req, res, next) => {
  try {
    const { deviceId, name, type, boxId, active, status, metadata } = req.body || {}

    if (!deviceId || typeof deviceId !== 'string') {
      return next(Errors.BadRequest('`deviceId` must be a non-empty string'))
    }

    if (!name || typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a non-empty string'))
    }

    if (!type || typeof type !== 'string') {
      return next(Errors.BadRequest('`type` must be a non-empty string'))
    }

    const item = await addDevice({
      deviceId,
      name,
      type,
      boxId,
      active,
      status,
      metadata,
    })

    sendSuccessResponse(res, item)
  } catch (err) {
    if (err.message === 'DEVICE_ALREADY_EXISTS') {
      return next(Errors.Conflict('Device already exists'))
    }

    next(err)
  }
})

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get devices
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Number of devices to return
 *     responses:
 *       200:
 *         description: Devices fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceList'
 */
router.get('/devices', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getDevices(limit)

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
 * /devices/{deviceId}:
 *   get:
 *     summary: Get device by id
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Device identifier
 *     responses:
 *       200:
 *         description: Device fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/devices/:deviceId', async (req, res, next) => {
  try {
    const item = await getDevice(req.params.deviceId)

    if (!item) {
      return next(Errors.NotFound('Device not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /devices/{deviceId}:
 *   patch:
 *     summary: Update device
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Device identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               boxId:
 *                 type: string
 *                 nullable: true
 *               active:
 *                 type: boolean
 *               status:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Device updated successfully
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
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/devices/:deviceId', async (req, res, next) => {
  try {
    const { deviceId } = req.params
    const { name, type, boxId, active, status, metadata } = req.body || {}

    const patch = {}

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return next(Errors.BadRequest('`name` must be a string'))
      }
      patch.name = name
    }

    if (type !== undefined) {
      if (typeof type !== 'string') {
        return next(Errors.BadRequest('`type` must be a string'))
      }
      patch.type = type
    }

    if (boxId !== undefined) {
      if (boxId !== null && typeof boxId !== 'string') {
        return next(Errors.BadRequest('`boxId` must be a string or null'))
      }
      patch.boxId = boxId
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

    if (metadata !== undefined) {
      if (typeof metadata !== 'object' || Array.isArray(metadata) || metadata === null) {
        return next(Errors.BadRequest('`metadata` must be an object'))
      }
      patch.metadata = metadata
    }

    const item = await patchDevice(deviceId, patch)

    if (!item) {
      return next(Errors.NotFound('Device not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /devices/{deviceId}:
 *   delete:
 *     summary: Delete device
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Device identifier
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/devices/:deviceId', async (req, res, next) => {
  try {
    const { deviceId } = req.params

    const deleted = await removeDevice(deviceId)

    if (!deleted) {
      return next(Errors.NotFound('Device not found'))
    }

    sendSuccessResponse(res, {
      deleted: true,
      id: deviceId,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
