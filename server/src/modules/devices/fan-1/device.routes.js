const { Errors } = require('ds-express-errors')
const express = require('express')
const {
  publishDeviceAccessSet,
  publishDeviceEndSession,
  addDevice,
  getDevicesForOrganization,
  getDevice,
  patchDevice,
  removeDevice,
} = require('./device.service')
const { forceEndSessionByDeviceId } = require('../../sessions/sessions.service')
const client = require('../../../mqtt/client')
const { sendSuccessResponse } = require('../../../responses/default.response')
const { requireAuth } = require('../../auth/auth.middleware')
const {
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
} = require('../../auth/role.middleware')

const router = express.Router()

router.post('/devices/:deviceId/access-set', (req, res, next) => {
  try {
    const { deviceId } = req.params
    const { enabled, sessionId, durationSec } = req.body || {}

    if (!deviceId || typeof deviceId !== 'string') {
      return next(Errors.BadRequest('`deviceId` must be a non-empty string'))
    }

    if (typeof enabled !== 'boolean') {
      return next(Errors.BadRequest('`enabled` must be boolean'))
    }

    if (enabled && (!sessionId || typeof sessionId !== 'string')) {
      return next(Errors.BadRequest('`sessionId` must be a non-empty string when `enabled=true`'))
    }

    if (durationSec !== undefined) {
      if (!Number.isInteger(durationSec) || durationSec < 0) {
        return next(Errors.BadRequest('`durationSec` must be a non-negative integer'))
      }
    }

    if (!client.connected) {
      return next(Errors.ServiceUnavailable('MQTT broker is not connected'))
    }

    publishDeviceAccessSet(deviceId, enabled, sessionId, durationSec)

    sendSuccessResponse(res, {
      deviceId,
      enabled,
      sessionId: sessionId || null,
      durationSec: durationSec ?? null,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/devices/:deviceId/end-session', (req, res, next) => {
  try {
    const { deviceId } = req.params
    const { reason, sessionId } = req.body || {}

    if (!deviceId || typeof deviceId !== 'string') {
      return next(Errors.BadRequest('`deviceId` must be a non-empty string'))
    }

    if (reason !== undefined && typeof reason !== 'string') {
      return next(Errors.BadRequest('`reason` must be a string'))
    }

    if (sessionId !== undefined && typeof sessionId !== 'string') {
      return next(Errors.BadRequest('`sessionId` must be a string'))
    }

    if (!client.connected) {
      return next(Errors.ServiceUnavailable('MQTT broker is not connected'))
    }

    publishDeviceEndSession(deviceId, reason || 'manual')

    Promise.resolve(forceEndSessionByDeviceId(deviceId, reason || 'manual', sessionId))
      .then((session) => {
        sendSuccessResponse(res, {
          deviceId,
          reason: reason || 'manual',
          sessionId: session ? session.sessionId : sessionId || null,
          boxId: session ? session.boxId : null,
        })
      })
      .catch(next)
  } catch (error) {
    next(error)
  }
})

router.post('/devices', requireAuth, requireUserProfile, requireOperationsRole, async (req, res, next) => {
  try {
    const { deviceId, name, type, boxId, active, status, metadata, organizationId } = req.body || {}

    if (!deviceId || typeof deviceId !== 'string') {
      return next(Errors.BadRequest('`deviceId` must be a non-empty string'))
    }

    if (!name || typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a non-empty string'))
    }

    if (!type || typeof type !== 'string') {
      return next(Errors.BadRequest('`type` must be a non-empty string'))
    }

    const item = await addDevice(req.userProfile, {
      deviceId,
      name,
      type,
      boxId,
      active,
      status,
      metadata,
      organizationId,
    })

    sendSuccessResponse(res, item)
  } catch (err) {
    if (err.message === 'DEVICE_ALREADY_EXISTS') {
      return next(Errors.Conflict('Device already exists'))
    }

    if (err.message === 'CURRENT_ORGANIZATION_NOT_SET') {
      return next(Errors.Forbidden('Current organization is not set'))
    }

    if (err.message === 'ORGANIZATION_ACCESS_DENIED') {
      return next(Errors.Forbidden('Cannot create device in this organization'))
    }

    if (err.message === 'BOX_NOT_FOUND') {
      return next(Errors.BadRequest('Selected box was not found'))
    }

    if (err.message === 'BOX_OUTSIDE_ORGANIZATION') {
      return next(Errors.BadRequest('Box must belong to the same organization'))
    }

    next(err)
  }
})

router.get('/devices', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getDevicesForOrganization(
      req.userProfile.currentOrganizationId,
      limit
    )

    sendSuccessResponse(res, {
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/devices/:deviceId', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const item = await getDevice(req.params.deviceId)

    if (!item) {
      return next(Errors.NotFound('Device not found'))
    }

    if (item.organizationId !== req.userProfile.currentOrganizationId) {
      return next(Errors.Forbidden('Cannot access device from another organization'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

router.patch('/devices/:deviceId', requireAuth, requireUserProfile, requireOperationsRole, async (req, res, next) => {
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

    const item = await patchDevice(req.userProfile, deviceId, patch)

    if (!item) {
      return next(Errors.NotFound('Device not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    if (err.message === 'ORGANIZATION_ACCESS_DENIED') {
      return next(Errors.Forbidden('Cannot modify device from another organization'))
    }

    if (err.message === 'BOX_NOT_FOUND') {
      return next(Errors.BadRequest('Selected box was not found'))
    }

    if (err.message === 'BOX_OUTSIDE_ORGANIZATION') {
      return next(Errors.BadRequest('Box must belong to the same organization'))
    }

    next(err)
  }
})

router.delete('/devices/:deviceId', requireAuth, requireUserProfile, requireOperationsRole, async (req, res, next) => {
  try {
    const { deviceId } = req.params

    const deleted = await removeDevice(req.userProfile, deviceId)

    if (!deleted) {
      return next(Errors.NotFound('Device not found'))
    }

    sendSuccessResponse(res, {
      deleted: true,
      id: deviceId,
    })
  } catch (err) {
    if (err.message === 'ORGANIZATION_ACCESS_DENIED') {
      return next(Errors.Forbidden('Cannot delete device from another organization'))
    }

    next(err)
  }
})

module.exports = router
