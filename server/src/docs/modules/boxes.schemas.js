const BoxSchemas = {
  BoxAuthResultRequest: {
    type: 'object',
    required: ['uid', 'allowed'],
    properties: {
      uid: {
        type: 'string',
      },
      allowed: {
        type: 'boolean',
      },
      userId: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      deviceIds: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      sessionId: {
        type: 'string',
      },
      role: {
        type: 'string',
      },
      sessionDurationSec: {
        type: 'integer',
      },
      mode: {
        type: 'string',
      },
      reason: {
        type: 'string',
      },
    },
  },

  BoxEndSessionRequest: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: {
        type: 'string',
      },
      reason: {
        type: 'string',
      },
    },
  },
}

module.exports = BoxSchemas