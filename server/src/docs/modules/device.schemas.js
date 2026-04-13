const DeviceSchemas = {
  FanSetRequest: {
    type: 'object',
    required: ['enabled'],
    properties: {
      enabled: {
        type: 'boolean',
        enum: [true, false],
      },
      sessionId: {
        type: 'string',
        example: 'sess_123',
      },
      deviceId: {
        type: 'string',
        example: 'fan_device_1',
      },
    },
  },

  FanSetSuccessResponse: {
    type: 'object',
    required: ['success', 'enabled'],
    properties: {
      success: {
        type: 'boolean',
        enum: [true],
      },
      enabled: {
        type: 'boolean',
        enum: [true, false],
      },
    },
  },
}

module.exports = DeviceSchemas