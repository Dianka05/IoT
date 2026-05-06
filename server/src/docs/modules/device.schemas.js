const DeviceSchemas = {
  DeviceAccessSetRequest: {
    type: 'object',
    required: ['enabled'],
    properties: {
      enabled: {
        type: 'boolean',
        enum: [true, false],
      },
      sessionId: {
        type: 'string',
        example: 'session-123',
      },
      durationSec: {
        type: 'integer',
        example: 600,
      },
    },
  },

  DeviceEndSessionRequest: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        example: 'session-123',
      },
      reason: {
        type: 'string',
        example: 'manual',
      },
    },
  },
}

module.exports = DeviceSchemas
