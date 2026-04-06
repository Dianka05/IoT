const express = require('express')
const { logAuthRequestReceived, logAuthDenied, logAuthGranted, logSessionStarted, logSessionEnded } = require('./logs.store.firestore')
const { getRecentLogs, writeLog } = require('./logs.service')

const router = express.Router()


router.get('/health/firebase', async (req, res, next) => {
  try {
    const snapshot = await db
      .collection('_healthcheck')
      .doc('connection-test')
      .get()

    res.json({
      success: true,
      firebaseConnected: true,
      docExists: snapshot.exists,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/logs/test-write', async (req, res, next) => {
  try {
    const result = await writeLog({
      type: 'manual_test',
      level: 'info',
      source: 'http',
      message: 'Manual Firestore log test',
      payload: {
        route: '/logs/test-write',
      },
    })

    res.json({
      success: true,
      logCreated: true,
      id: result.id,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/logs', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 20)
    const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit

    const logs = await getRecentLogs(limit)

    res.json({
      success: true,
      items: logs,
      count: logs.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/logs/test-scenario', async (req, res, next) => {
  try {
    const authPayload = {
      boxId: 'main-box-1',
      uid: 'A27A7B38',
    }

    const session = {
      sessionId: 'test-session-001',
      boxId: 'main-box-1',
      uid: 'A27A7B38',
      userId: 'user123',
      userName: 'Harry Potter',
      role: 'admin',
      deviceIds: ['fan-1'],
      sessionDurationSec: 3600,
      mode: 'normal',
      status: 'pending',
    }

    await logAuthRequestReceived(authPayload)
    await logAuthDenied(
      { boxId: 'main-box-1', uid: 'UNKNOWN_UID' },
      'UID not recognized'
    )
    await logAuthGranted(session)
    await logSessionStarted({
      boxId: 'main-box-1',
      sessionId: session.sessionId,
    })
    await logSessionEnded(
      {
        boxId: 'main-box-1',
        sessionId: session.sessionId,
      },
      session
    )

    res.json({
      success: true,
      message: 'Test log scenario created successfully',
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router