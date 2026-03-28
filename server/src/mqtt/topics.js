const topics = {
  deviceCommand: (deviceId, commandName) => `device/${deviceId}/cmd/${commandName}`,
  deviceState: (deviceId, stateName) => `device/${deviceId}/state/${stateName}`,
  deviceStatus: (deviceId) => `device/${deviceId}/state/status`,

  boxCommand: (boxId, commandName) => `box/${boxId}/cmd/${commandName}`,
  boxState: (boxId, stateName) => `box/${boxId}/state/${stateName}`,
  boxStatus: (boxId) => `box/${boxId}/state/status`,
  boxEvent: (boxId, eventName) => `box/${boxId}/event/${eventName}`,
}

module.exports = topics