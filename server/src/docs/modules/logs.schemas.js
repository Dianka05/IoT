const LogSchemas = {
  LogItem: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'AYpmTVqIgX7Xccmpu7TA',
      },
      type: {
        type: 'string',
        example: 'auth_denied',
      },
      level: {
        type: 'string',
        example: 'info',
      },
      source: {
        type: 'string',
        example: 'mqtt',
      },
      boxId: {
        type: 'string',
        example: 'main-1',
      },
      uid: {
        type: 'string',
        example: 'B9B8409D',
      },
      reason: {
        type: 'string',
        example: 'no_pending_session',
      },
      message: {
        type: 'string',
        example: 'Access denied',
      },
      payload: {
        type: 'object',
        additionalProperties: true, // важно 👈 payload может быть любой
      },
      createdAt: {
        type: 'object',
        properties: {
          _seconds: {
            type: 'integer',
            example: 1775557442,
          },
          _nanoseconds: {
            type: 'integer',
            example: 88000000,
          },
        },
      },
    },
  },

  LogsResponse: {
    type: 'object',
    required: ['success', 'items', 'count'],
    properties: {
      success: {
        type: 'boolean',
        enum: [true],
        example: true,
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/LogItem',
        },
      },
      count: {
        type: 'integer',
        example: 4,
      },
    },
  },

  FirebaseHealthResponse: {
    type: 'object',
    required: ['success', 'firebaseConnected', 'docExists'],
    properties: {
      success: {
        type: 'boolean',
        enum: [true],
        example: true,
      },
      firebaseConnected: {
        type: 'boolean',
        example: true,
      },
      docExists: {
        type: 'boolean',
        example: true,
      },
    },
  },
}

module.exports = LogSchemas