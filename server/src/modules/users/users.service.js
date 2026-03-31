const {
  upsertUser,
  listUsers,
  getUserByUid,
} = require('./users.store.firestore')

const seedData = [
  {
    userId: 'user123',
    uid: 'A27A7B38',
    name: 'Harry Potter',
    role: 'admin',
    active: true,
    allowedDeviceIds: ['fan-1'],
    sessionDurationSec: 3600,
  },
  {
    userId: 'user456',
    uid: 'B11B22C3',
    name: 'Hermione Granger',
    role: 'user',
    active: true,
    allowedDeviceIds: ['fan-1'],
    sessionDurationSec: 1800,
  },
  {
    userId: 'user789',
    uid: 'X00X00X0',
    name: 'Blocked User',
    role: 'user',
    active: false,
    allowedDeviceIds: ['fan-1'],
    sessionDurationSec: 900,
  },
]

async function getUsers(limit = 50) {
  return listUsers(limit)
}

async function seedUsers() {
  for (const user of seedData) {
    await upsertUser(user)
  }

  return seedData
}

async function findUserByUid(uid) {
  return getUserByUid(uid)
}

async function findActiveUserByUid(uid) {
  const user = await getUserByUid(uid)

  if (!user) return null
  if (user.active !== true) return null

  return user
}

module.exports = {
  getUsers,
  seedUsers,
  findUserByUid,
  findActiveUserByUid,
}