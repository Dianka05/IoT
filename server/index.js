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
const organizationsRoutes = require('./src/modules/organizations/organizations.routes')

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
const allowedOrigins = ['http://localhost:5173']
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
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
app.use(cookieParser())

const swaggerSpec = swaggerJsdoc(options);
console.log('PATHS:', Object.keys(swaggerSpec.paths || {}))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', fanRoutes)
app.use('/api', mainBoxRoutes)

app.use('/api', sessionRoutes)
app.use('/api', userRoutes)

app.use('/api', logsRoutes)

app.use('/api', activitiesRoutes)

app.use('/api', organizationsRoutes)

app.use('/api', authRoutes)

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

app.listen(process.env.PORT || 3001, () => {
  logDebug(
    'HTTP server running on http://localhost:' + (process.env.PORT || 3001),
  )
})

app.use(errorHandler)
