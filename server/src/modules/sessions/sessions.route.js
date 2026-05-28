const express = require('express')
const { Errors } = require('ds-express-errors')
const {
  getSessionsForProfile,
  getSessionByIdForProfile,
  startSessionById,
  endSessionById,
  createPendingSession,
} = require('./sessions.service')
const { sendSuccessResponse } = require('../../responses/default.response')
const { requireAuth } = require('../auth/auth.middleware')
const {
  requireUserProfile,
  requireOrganizationContext,
} = require('../auth/role.middleware')

const router = express.Router()

router.get('/sessions', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit
    const status = req.query.status || null

    const items = await getSessionsForProfile(req.userProfile, limit, status)

    sendSuccessResponse(res, {
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/sessions/:sessionId', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const item = await getSessionByIdForProfile(
      req.userProfile,
      req.params.sessionId
    )

    if (!item) {
      return next(Errors.NotFound('Session not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

router.post('/sessions', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const { boxId, uid, deviceIds, sessionDurationSec, mode, scheduledStartAt } = req.body || {}

    if (!boxId || typeof boxId !== 'string') {
      return next(Errors.BadRequest('`boxId` must be a non-empty string'))
    }

    if (!uid || typeof uid !== 'string') {
      return next(Errors.BadRequest('`uid` must be a non-empty string'))
    }

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return next(Errors.BadRequest('`deviceIds` must be a non-empty array'))
    }

    const session = await createPendingSession({
      boxId,
      uid,
      deviceIds,
      sessionDurationSec,
      mode,
      scheduledStartAt,
    })

    sendSuccessResponse(res, { item: session })
  } catch (err) {
    const message = String(err.message || '')

    if (
      message === 'BOX_NOT_FOUND' ||
      message === 'BOX_ORGANIZATION_NOT_SET'
    ) {
      return next(Errors.BadRequest(message))
    }

    if (
      message.includes('Reservation cannot be created in the past') ||
      message.includes('Scheduled reservations must be created at least 1 minute in advance') ||
      message.includes('Reservations cannot be scheduled more than 7 days ahead') ||
      message.includes('Device not found') ||
      message.includes('Device is outside organization') ||
      message.includes('Device does not belong to box') ||
      message.includes('Device is not allowed for user') ||
      message.includes('Device is currently in use') ||
      message.includes('Device already has a future reservation') ||
      message.includes('Device is waiting for RFID confirmation') ||
      message.includes('Device is still held by another unfinished reservation') ||
      message.includes('Device is in maintenance mode') ||
      message.includes('Device is not available') ||
      message.includes('Box is in maintenance mode') ||
      message.includes('Box is not available')
    ) {
      return next(Errors.BadRequest(message))
    }

    next(err)
  }
})

router.post('/sessions/:sessionId/start', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const existing = await getSessionByIdForProfile(
      req.userProfile,
      req.params.sessionId
    )

    if (!existing) {
      return next(Errors.NotFound('Session not found'))
    }

    const item = await startSessionById(req.params.sessionId)

    if (!item || item.organizationId !== req.userProfile.currentOrganizationId) {
      return next(Errors.NotFound('Session not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

router.post('/sessions/:sessionId/end', requireAuth, requireUserProfile, requireOrganizationContext, async (req, res, next) => {
  try {
    const { reason } = req.body || {}

    if (reason !== undefined && typeof reason !== 'string') {
      return next(Errors.BadRequest('`reason` must be a string'))
    }

    const existing = await getSessionByIdForProfile(
      req.userProfile,
      req.params.sessionId
    )

    if (!existing) {
      return next(Errors.NotFound('Session not found'))
    }

    const item = await endSessionById(
      req.params.sessionId,
      reason || 'manual',
      req.userProfile
    )

    if (!item || item.organizationId !== req.userProfile.currentOrganizationId) {
      return next(Errors.NotFound('Session not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

module.exports = router
