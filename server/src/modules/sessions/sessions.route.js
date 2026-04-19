const express = require('express')
const { Errors } = require('ds-express-errors')

const {
  getSessions,
  getSessionById,
  startSessionById,
  endSessionById,
  createPendingSession,
} = require('./sessions.service')
const { sendSuccessResponse } = require('../../responses/default.response')

const router = express.Router()


/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get sessions
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Number of sessions to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: pending
 *         description: Filter by session status
 *     responses:
 *       200:
 *         description: Sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionsListResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit
    const status = req.query.status || null

    const items = await getSessions(limit, status)

    sendSuccessResponse(res, {
      items,
      count: items.length
    })
  } catch (err) {
    next(err)
  }
})


/**
 * @swagger
 * /sessions/{sessionId}:
 *   get:
 *     summary: Get session by id
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Session fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionSingleResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/sessions/:sessionId', async (req, res, next) => {
  try {
    const item = await getSessionById(req.params.sessionId)

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create pending session
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *     responses:
 *       200:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionSingleResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sessions', async (req, res, next) => {
  try {
    const {
      boxId,
      uid,
      deviceIds,
      sessionDurationSec,
      mode,
    } = req.body || {}


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
    })

    sendSuccessResponse(res, {item: session})
  } catch (err) {
    next(err)
  }
})


/**
 * @swagger
 * /sessions/{sessionId}/start:
 *   post:
 *     summary: Start session by id
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionSingleResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sessions/:sessionId/start', async (req, res, next) => {
  try {
    const item = await startSessionById(req.params.sessionId)

    if (!item) {
      return next(Errors.NotFound('Session not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})


/**
 * @swagger
 * /sessions/{sessionId}/end:
 *   post:
 *     summary: End session by id
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionSingleResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sessions/:sessionId/end', async (req, res, next) => {
  try {
    const item = await endSessionById(req.params.sessionId)

    if (!item) {
      return next(Errors.NotFound('Session not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

module.exports = router