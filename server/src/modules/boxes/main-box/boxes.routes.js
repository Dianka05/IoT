const express = require('express')
const router = express.Router()
const client = require('../../../mqtt/client')
const { Errors } = require('ds-express-errors')
const { publishAuthResult, publishEndSession } = require('./boxes.service')
const { sendSuccessResponse } = require('../../../responses/default.response')
const {
  addBox,
  getBoxesForOrganization,
  getBox,
  patchBox,
  removeBox,
} = require('./boxes.service')
const { requireAuth } = require('../../auth/auth.middleware')
const {
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
} = require('../../auth/role.middleware')

router.post('/boxes', requireAuth, requireUserProfile, requireOperationsRole, async (req, res, next) => {
  try {
    const { boxId, name, location, active, status, deviceIds, organizationId } = req.body || {}

    if (!boxId || typeof boxId !== 'string') {
      return next(Errors.BadRequest('`boxId` must be a non-empty string'))
    }

    if (!name || typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a non-empty string'))
    }

    if (deviceIds && !Array.isArray(deviceIds)) {
      return next(Errors.BadRequest('`deviceIds` must be an array'))
    }

    const item = await addBox(req.userProfile, {
      boxId,
      name,
      location,
      active,
      status,
      deviceIds,
      organizationId,
    })

    sendSuccessResponse(res, item)
  } catch (err) {
    if (err.message === 'BOX_ALREADY_EXISTS') {
      return next(Errors.Conflict('Box already exists'))
    }

    if (err.message === 'CURRENT_ORGANIZATION_NOT_SET') {
      return next(Errors.Forbidden('Current organization is not set'))
    }

    if (err.message === 'ORGANIZATION_ACCESS_DENIED') {
      return next(Errors.Forbidden('Cannot create box in this organization'))
    }

    if (String(err.message || '').startsWith('DEVICE_NOT_FOUND:')) {
      return next(Errors.BadRequest('One or more devices were not found'))
    }

    if (String(err.message || '').startsWith('DEVICE_OUTSIDE_ORGANIZATION:')) {
      return next(Errors.BadRequest('Device must belong to the same organization'))
    }

    next(err)
  }
})

router.get('/boxes', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getBoxesForOrganization(
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

router.get('/boxes/:boxId', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const item = await getBox(req.params.boxId)

    if (!item) {
      return next(Errors.NotFound('Box not found'))
    }

    if (item.organizationId !== req.userProfile.currentOrganizationId) {
      return next(Errors.Forbidden('Cannot access box from another organization'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

router.patch('/boxes/:boxId', requireAuth, requireUserProfile, requireOperationsRole, async (req, res, next) => {
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

    const item = await patchBox(req.userProfile, boxId, patch)

    if (!item) {
      return next(Errors.NotFound('Box not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    if (err.message === 'ORGANIZATION_ACCESS_DENIED') {
      return next(Errors.Forbidden('Cannot modify box from another organization'))
    }

    if (String(err.message || '').startsWith('DEVICE_NOT_FOUND:')) {
      return next(Errors.BadRequest('One or more devices were not found'))
    }

    if (String(err.message || '').startsWith('DEVICE_OUTSIDE_ORGANIZATION:')) {
      return next(Errors.BadRequest('Device must belong to the same organization'))
    }

    next(err)
  }
})

router.delete('/boxes/:boxId', requireAuth, requireUserProfile, requireOperationsRole, async (req, res, next) => {
  try {
    const { boxId } = req.params

    const deleted = await removeBox(req.userProfile, boxId)

    if (!deleted) {
      return next(Errors.NotFound('Box not found'))
    }

    sendSuccessResponse(res, {
      deleted: true,
      id: boxId,
    })
  } catch (err) {
    if (err.message === 'ORGANIZATION_ACCESS_DENIED') {
      return next(Errors.Forbidden('Cannot delete box from another organization'))
    }

    next(err)
  }
})

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

    sendSuccessResponse(res, {
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

    sendSuccessResponse(res, {
      boxId,
      reason,
      sessionId,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
