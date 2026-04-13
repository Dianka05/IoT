const express = require('express')
const { getRecentLogs, writeLog } = require('./logs.store.firestore')
const { logAuthRequestReceived, logAuthDenied, logAuthGranted, logSessionStarted, logSessionEnded,  } = require('./logs.service')
const { sendSuccessResponse } = require('../../responses/default.response')

const router = express.Router()

/**
 * @swagger
 * /health/firebase:
 *   get:
 *     summary: Check Firebase connection
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Firebase connection status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FirebaseHealthResponse'
 *       500:
 *         description: Internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/health/firebase', async (req, res, next) => {
  try {
    const snapshot = await db
      .collection('_healthcheck')
      .doc('connection-test')
      .get()

    sendSuccessResponse(res, {
      firebaseConnected: true,
      docExists: snapshot.exists,
    })
    
  } catch (err) {
    next(err)
  }
})



/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get recent logs
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *         description: Number of logs to return
 *     responses:
 *       200:
 *         description: Logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogsResponse'
 *       500:
 *         description: Internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/logs', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 20)
    const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit

    const logs = await getRecentLogs(limit)

    sendSuccessResponse(res, {
      items: logs,
      count: logs.length,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router