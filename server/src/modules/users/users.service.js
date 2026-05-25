const { auth } = require('../../integrations/firebase/firebase.client')
const {
  upsertUser,
  listUsers,
  listUsersByOrganization,
  getUserByActiveCardUid,
  getUserByAuthUid,
  getUserById,
  updateUserById,
  updateAllowedDeviceIds,
  deleteUserById,
} = require('./users.store.firestore')

const seedData = [
  {
    userId: 'user123',
    name: 'Harry Potter',
    role: 'admin',
    active: true,
    allowedDeviceIds: ['fan-1'],
    cards: [
    {
      uid: "A27A7B38",
      status: "active"
    },
    {
      uid: "B12C44D9",
      status: "lost"
    }
  ]
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
  return getUserByActiveCardUid(uid)
}

async function findActiveUserByUid(uid) {
  const user = await getUserByActiveCardUid(uid)

  if (!user) return null
  if (user.active !== true) return null

  return user
}


async function findUserByAuthUid(authUid) {
  return getUserByAuthUid(authUid)
}

async function ensureAuthUserProfile({ authUid, email, name }) {
  const existing = await getUserByAuthUid(authUid)
  if (existing) return existing

  const profile = {
    userId: authUid,
    authUid,
    email: email || null,
    name: name || null,
    role: 'user',
    active: true,
    organizationId: process.env.DEFAULT_ORGANIZATION_ID || 'default-org',
    allowedDeviceIds: [],
    cards: [],
  }

  await upsertUser(profile)
  return getUserByAuthUid(authUid)
}

async function patchUser(uid, patch) {
  return updateUserById(uid, patch)
}

async function patchUserAllowedDeviceIds(uid, allowedDeviceIds) {
  return updateAllowedDeviceIds(uid, allowedDeviceIds)
}

async function getUsersForOrganization(organizationId, limit = 50) {
  return listUsersByOrganization(organizationId, limit)
}

async function createUserAsAdmin(adminProfile, data) {
  const organizationId = adminProfile.organizationId

  if (!organizationId) {
    throw new Error('ADMIN_ORGANIZATION_NOT_SET')
  }

  const createdAuthUser = await auth.createUser({
    email: data.email,
    password: data.password,
    displayName: data.name || undefined,
    disabled: data.active === false,
  })

  const profile = {
    userId: createdAuthUser.uid,
    authUid: createdAuthUser.uid,
    email: data.email,
    name: data.name || null,
    role: data.role || 'user',
    active: data.active ?? true,
    organizationId,
    allowedDeviceIds: Array.isArray(data.allowedDeviceIds)
      ? data.allowedDeviceIds
      : [],
    cards: Array.isArray(data.cards) ? data.cards : [],
    sessionDurationSec: data.sessionDurationSec || 1800,
  }

  await upsertUser(profile)

  return getUserById(createdAuthUser.uid)
}

async function assertSameOrganization(adminProfile, targetUserId) {
  const targetUser = await getUserById(targetUserId)

  if (!targetUser) {
    return {
      allowed: false,
      reason: 'USER_NOT_FOUND',
      user: null,
    }
  }

  if (!targetUser.organizationId) {
    return {
      allowed: false,
      reason: 'TARGET_USER_ORGANIZATION_NOT_SET',
      user: targetUser,
    }
  }

  if (targetUser.organizationId !== adminProfile.organizationId) {
    return {
      allowed: false,
      reason: 'DIFFERENT_ORGANIZATION',
      user: targetUser,
    }
  }

  return {
    allowed: true,
    reason: null,
    user: targetUser,
  }
}

async function patchUserAsAdmin(adminProfile, uid, patch) {
  const check = await assertSameOrganization(adminProfile, uid)

  if (!check.allowed) {
    return check
  }

  const updated = await updateUserById(uid, patch)

  return {
    allowed: true,
    reason: null,
    user: updated,
  }
}

async function patchUserAllowedDeviceIdsAsAdmin(adminProfile, uid, allowedDeviceIds) {
  const check = await assertSameOrganization(adminProfile, uid)

  if (!check.allowed) {
    return check
  }

  const updated = await updateAllowedDeviceIds(uid, allowedDeviceIds)

  return {
    allowed: true,
    reason: null,
    user: updated,
  }
}

async function removeUserAsAdmin(adminProfile, uid) {
  const check = await assertSameOrganization(adminProfile, uid)

  if (!check.allowed) {
    return check
  }

  await deleteUserById(uid)

  try {
    await auth.deleteUser(uid)
  } catch (err) {
    console.error('Failed to delete Firebase Auth user:', err)
  }

  return {
    allowed: true,
    reason: null,
    user: check.user,
  }
}

async function removeUser(uid) {
  const user = await getUserById(uid)
  if (!user) return false

  await deleteUserById(uid)

  try {
    await auth.deleteUser(uid)
  } catch (err) {
    console.error('Failed to delete Firebase Auth user:', err)
  }

  return true
}


module.exports = {
  getUsersForOrganization,
  createUserAsAdmin,
  patchUserAsAdmin,
  patchUserAllowedDeviceIdsAsAdmin,
  removeUserAsAdmin,
  getUsers,
  seedUsers,
  findUserByUid,
  findActiveUserByUid,
  findUserByAuthUid,
  ensureAuthUserProfile,
  patchUser,
  patchUserAllowedDeviceIds,
  removeUser,
}