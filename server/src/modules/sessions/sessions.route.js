const express = require('express')
const { Errors } = require('ds-express-errors')

const {
  getSessions,
  getSessionById,
  createTestSession,
  startSessionById,
  endSessionById,
} = require('./sessions.service')

const router = express.Router()

router.get('/sessions', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit
    const status = req.query.status || null

    const items = await getSessions(limit, status)

    res.json({
      success: true,
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/sessions/:sessionId', async (req, res, next) => {
  try {
    const item = await getSessionById(req.params.sessionId)

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/sessions/test-create', async (req, res, next) => {
  try {
    const {
      boxId,
      uid,
      userId,
      userName,
      role,
      deviceIds,
      sessionDurationSec,
      mode,
    } = req.body || {}

    if (deviceIds && !Array.isArray(deviceIds)) {
      return next(Errors.BadRequest('`deviceIds` must be an array'))
    }

    const session = await createTestSession({
      boxId,
      uid,
      userId,
      userName,
      role,
      deviceIds,
      sessionDurationSec,
      mode,
    })

    res.json({
      success: true,
      item: session,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/sessions/:sessionId/start', async (req, res, next) => {
  try {
    const item = await startSessionById(req.params.sessionId)

    if (!item) {
      return next(Errors.NotFound('Session not found'))
    }

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/sessions/:sessionId/end', async (req, res, next) => {
  try {
    const item = await endSessionById(req.params.sessionId)

    if (!item) {
      return next(Errors.NotFound('Session not found'))
    }

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router