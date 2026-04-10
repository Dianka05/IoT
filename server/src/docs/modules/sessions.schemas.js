const SessionSchemas = {
  FirestoreTimestamp: {
    type: 'object',
    required: ['_seconds', '_nanoseconds'],
    properties: {
      _seconds: {
        type: 'integer',
        example: 1775487612,
      },
      _nanoseconds: {
        type: 'integer',
        example: 321000000,
      },
    },
  },

  SessionItem: {
    type: 'object',
    required: [
      'id',
      'deviceIds',
      'role',
      'sessionId',
      'sessionDurationSec',
      'userName',
      'userId',
      'mode',
      'uid',
      'createdAt',
      'boxId',
      'status',
      'updatedAt',
    ],
    properties: {
      id: {
        type: 'string',
        example: '9a6d66dc-baf3-4058-acd5-84a0c06fd696',
      },
      deviceIds: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
        },
        example: ['fan-1'],
      },
      role: {
        type: 'string',
        example: 'admin',
      },
      sessionId: {
        type: 'string',
        example: '9a6d66dc-baf3-4058-acd5-84a0c06fd696',
      },
      sessionDurationSec: {
        type: 'integer',
        example: 3600,
      },
      userName: {
        type: 'string',
        example: 'Harry Potter',
      },
      userId: {
        type: 'string',
        example: 'user123',
      },
      mode: {
        type: 'string',
        example: 'manual',
      },
      uid: {
        type: 'string',
        example: 'A27A7B38',
      },
      createdAt: {
        $ref: '#/components/schemas/FirestoreTimestamp',
      },
      boxId: {
        type: 'string',
        example: 'main-1',
      },
      startedAt: {
        $ref: '#/components/schemas/FirestoreTimestamp',
      },
      endedAt: {
        $ref: '#/components/schemas/FirestoreTimestamp',
      },
      status: {
        type: 'string',
        example: 'ended',
      },
      updatedAt: {
        $ref: '#/components/schemas/FirestoreTimestamp',
      },
    },
  },

  CreateSessionRequest: {
    type: 'object',
    required: ['boxId', 'uid', 'deviceIds'],
    properties: {
      boxId: {
        type: 'string',
        example: 'main-1',
      },
      uid: {
        type: 'string',
        example: 'A27A7B38',
      },
      deviceIds: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
        },
        example: ['fan-1'],
      },
      sessionDurationSec: {
        type: 'integer',
        example: 3600,
      },
      mode: {
        type: 'string',
        example: 'manual',
      },
    },
  },

  SessionsListResponse: {
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
          $ref: '#/components/schemas/SessionItem',
        },
      },
      count: {
        type: 'integer',
        example: 1,
      },
    },
  },

  SessionSingleResponse: {
    type: 'object',
    required: ['success', 'item'],
    properties: {
      success: {
        type: 'boolean',
        enum: [true],
        example: true,
      },
      item: {
        $ref: '#/components/schemas/SessionItem',
      },
    },
  },
}

module.exports = SessionSchemas