const UserSchemas = {
  UserCard: {
    type: 'object',
    required: ['uid', 'status'],
    properties: {
      uid: {
        type: 'string',
        example: 'A27A7B38',
      },
      status: {
        type: 'string',
        example: 'active',
      },
    },
  },

  UserItem: {
    type: 'object',
    required: [
      'id',
      'createdAt',
      'role',
      'name',
      'active',
      'allowedDeviceIds',
      'userId',
      'updatedAt',
      'cards',
    ],
    properties: {
      id: {
        type: 'string',
        example: 'user123',
      },

      createdAt: {
        $ref: '#/components/schemas/FirestoreTimestamp',
      },

      updatedAt: {
        $ref: '#/components/schemas/FirestoreTimestamp',
      },

      name: {
        type: 'string',
        example: 'Harry Potter',
      },

      role: {
        type: 'string',
        example: 'admin',
      },

      active: {
        type: 'boolean',
        example: true,
      },

      userId: {
        type: 'string',
        example: 'user123',
      },

      authUid: {
        type: 'string',
        example: 'di1mEkWBFqPkLHQuBOPHZgqR2w43',
        description: 'Firebase auth UID',
      },

      email: {
        type: 'string',
        example: 'testuser@example.com',
      },

      sessionDurationSec: {
        type: 'integer',
        example: 3600,
      },

      allowedDeviceIds: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: ['fan-1'],
      },

      cards: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserCard',
        },
      },
    },
  },

  UsersListResponse: {
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
          $ref: '#/components/schemas/UserItem',
        },
      },
      count: {
        type: 'integer',
        example: 3,
      },
    },
  },

  UserSingleResponse: {
    type: 'object',
    required: ['success', 'item'],
    properties: {
      success: {
        type: 'boolean',
        enum: [true],
        example: true,
      },
      item: {
        $ref: '#/components/schemas/UserItem',
      },
    },
  },

  UsersSeedResponse: {
    type: 'object',
    required: ['success', 'seeded', 'count', 'items'],
    properties: {
      success: {
        type: 'boolean',
        enum: [true],
        example: true,
      },
      seeded: {
        type: 'boolean',
        enum: [true],
        example: true,
      },
      count: {
        type: 'integer',
        example: 3,
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserItem',
        },
      },
    },
  },
}

module.exports = UserSchemas