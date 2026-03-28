const FAN_DEVICE_ID = process.env.FAN_DEVICE_ID || 'fan-1';
const FAN_COMMAND = 'fan_set';

const MAIN_BOX_1 = {
  MAIN_BOX_ID: process.env.MAIN_BOX_ID || 'main-1',
  AUTH_RESULT_COMMAND: 'auth_result',
  END_SESSION_COMMAND: 'end_session',
};

module.exports = {
  FAN_DEVICE_ID,
  FAN_COMMAND,
  MAIN_BOX_1,
};
