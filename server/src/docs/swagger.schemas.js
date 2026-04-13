const boxSchemas = require('./modules/boxes.schemas')
const deviceSchemas = require('./modules/device.schemas')
const logsSchemas = require('./modules/logs.schemas')
const sessionSchemas = require('./modules/sessions.schemas')
const userSchemas = require('./modules/users.schemas')

const defaultResponse = {
    ErrorResponse: {
        type: 'object',
        properties: {
        success: {
            type: 'boolean',
            enum: [false],
        },
        message: {
            type: 'string',
        },
        mqttConnected: {
            type: 'boolean',
            enum: [false],
        },
        request: {
            type: 'object',
            description: 'Present only in development mode',
            properties: {
                method: {
                type: 'string',
                example: 'POST',
                },
                url: {
                type: 'string',
                example: '/boxes/123/auth-result',
                },
            },
            },
        error: {
            type: 'object',
            properties: {
            name: {
                type: 'string',
            },
            message: {
                type: 'string',
            },
            stack: {
                type: 'string',
                description: 'Only in development mode',
                example: 'Error: ...',
                },
            },
        },
        },
    },
    SuccessResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                enum: [true],
            },
            info: {
                type: 'object',
            },
        }
    }
}

module.exports = {
    ...defaultResponse,
    ...boxSchemas,
    ...deviceSchemas,
    ...logsSchemas,
    ...sessionSchemas,
    ...userSchemas,
}