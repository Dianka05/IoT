require('dotenv').config()
const { errorHandler, setConfig, logDebug } = require('ds-express-errors')
const express = require('express')
const cors = require('cors')

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const schemas = require('./src/docs/swagger.schemas')


const fanRoutes = require('./src/modules/devices/fan-1/device.routes')
const mainBoxRoutes = require('./src/modules/boxes/main-box/boxes.routes')
const sessionRoutes = require('./src/modules/sessions/sessions.route')
const userRoutes = require('./src/modules/users/users.routes')
const logsRoutes = require('./src/modules/logs/logs.routes')
const authRoutes = require('./src/modules/auth/auth.routes')
const activitiesRoutes = require('./src/modules/activities/activities.routes')

const cookieParser = require('cookie-parser')

const client = require('./src/mqtt/client')
const { initMqtt } = require('./src/mqtt/init')


try {
  initMqtt()
} catch (error) {
  logDebug('Error occurred while initializing MQTT: ' + error.message)
    console.log("ss")
}

const app = express()
app.use(express.json())
app.use(cors())

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
        status: err.status,
        message: err.message,
        ...(isDev && { stack: err.stack })
      },
      
  }),
})

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ACS API',
      version: '1.0.0',
    },
    components: {
      schemas
    }
  },
  apis: [
    '*.js',
    './src/modules/**/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);
console.log('PATHS:', Object.keys(swaggerSpec.paths || {}))
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(fanRoutes)
app.use(mainBoxRoutes)

app.use(sessionRoutes)
app.use(userRoutes)

app.use(logsRoutes)

app.use(activitiesRoutes)


app.use(cookieParser())
app.use(authRoutes)

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check MQTT connection
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: MQTT connection status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   enum: [true, false]
 *                   example: true
 *                 mqttConnected:
 *                   type: boolean
 *                   example: true
 */
app.get('/health', (req, res, next) => {
  res.json({
    success: client.connected,
    mqttConnected: client.connected,
  })
})

app.listen(process.env.PORT || 3000, () => {
  logDebug(
    'HTTP server running on http://localhost:' + (process.env.PORT || 3000),
  )
})

app.use(errorHandler)
