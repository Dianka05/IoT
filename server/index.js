require('dotenv').config()
const { errorHandler, setConfig, logDebug, Errors } = require('ds-express-errors')
const express = require('express')

const fanRoutes = require('./src/modules/devices/fan-1/device.routes')
const mainBoxRoutes = require('./src/modules/boxes/main-box/boxes.routes')
const sessionRoutes = require('./src/modules/sessions/sessions.route')
const userRoutes = require('./src/modules/users/users.routes')


const client = require('./src/mqtt/client')
const { initMqtt } = require('./src/mqtt/init')
const { db } = require('./src/integrations/firebase/firebase.client')
const { writeLog, getRecentLogs } = require('./src/modules/logs/logs.store.firestore')
const {
  logAuthRequestReceived,
  logAuthDenied,
  logAuthGranted,
  logSessionStarted,
  logSessionEnded,
} = require('./src/modules/logs/logs.service')

initMqtt()

const app = express()
app.use(express.json())

setConfig({
  maxLoggerRequests: 100000,
  devEnvironments: ['development', 'test'],
  formatError: (err, {req, isDev}) => ({
      success: false,
      mqttConnected: client.connected,
      ...(isDev ? {
        request: {
          method: req.method,
          url: req.originalUrl,
        }
      } : {}),
      error: {
        name: err.name,
        message: err.message,
        stack: isDev ? err.stack : undefined,
      },
      
  }),
})

app.use(fanRoutes)
app.use(mainBoxRoutes)

app.use(sessionRoutes)
app.use(userRoutes)

app.get('/health', (req, res, next) => {
  res.json({
    success: true,
    mqttConnected: client.connected,
  })
})

app.get('/health/firebase', async (req, res, next) => {
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

app.get('/logs/test-write', async (req, res, next) => {
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

app.get('/logs', async (req, res, next) => {
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

app.get('/logs/test-scenario', async (req, res, next) => {
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

app.listen(process.env.PORT || 3000, () => {
  logDebug(
    'HTTP server running on http://localhost:' + (process.env.PORT || 3000),
  )
})

app.use(errorHandler)
