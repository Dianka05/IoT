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
const configurationRoutes = require('./src/modules/configuration/configuration.routes')

const cookieParser = require('cookie-parser')

const client = require('./src/mqtt/client')
const { initMqtt } = require('./src/mqtt/init')


const app = express()
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((value) => value.trim())
    : []),
].filter(Boolean)
const allowedOrigins = [...new Set([
  'http://localhost:5173',
  'https://iot-pink.vercel.app',
  ...configuredOrigins,
])]
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

app.use('/api', configurationRoutes)

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
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'iot-backend',
    mqttConnected: client.connected,
    mqttDisabled: client.disabled === true,
  })
})

app.get('/favicon.ico', (req, res) => {
  res.status(204).end()
})

app.get('/health', (req, res, next) => {
  res.json({
    success: client.connected,
    mqttConnected: client.connected,
    mqttDisabled: client.disabled === true,
  })
})

app.use(errorHandler)

try {
  initMqtt()
} catch (error) {
  logDebug('Error occurred while initializing MQTT: ' + error.message)
}

if (require.main === module) {
  app.listen(process.env.PORT || 3001, () => {
    logDebug(
      'HTTP server running on http://localhost:' + (process.env.PORT || 3001),
    )
  })
}

module.exports = app
