const { auth } = require('../../integrations/firebase/firebase.client')
const {
  upsertUser,
  listUsers,
  listUsersByOrganization,
  getUserByActiveCardUid,
  getUserByAuthUid,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('./users.store.firestore')

function uniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value)))]
}

function normalizeMembership(membership = {}) {
  return {
    organizationId: membership.organizationId || null,
    role: membership.role || 'user',
    active: membership.active !== false,
    allowedDeviceIds: Array.isArray(membership.allowedDeviceIds)
      ? uniqueStrings(membership.allowedDeviceIds)
      : [],
  }
}

function getMembershipForOrganization(user, organizationId) {
  if (!user || !organizationId) return null

  const memberships = Array.isArray(user.memberships) ? user.memberships : []
  const match = memberships.find(
    (membership) => membership.organizationId === organizationId
  )

  return match ? normalizeMembership(match) : null
}

function getAccessibleOrganizationIds(user) {
  const membershipIds = Array.isArray(user?.memberships)
    ? user.memberships.map((membership) => membership.organizationId)
    : []

  return uniqueStrings([
    ...(Array.isArray(user?.organizationIds) ? user.organizationIds : []),
    ...membershipIds,
    user?.organizationId || null,
  ])
}

function resolveCurrentOrganizationId(user, preferredOrganizationId = null) {
  const accessibleOrganizationIds = getAccessibleOrganizationIds(user)

  if (
    preferredOrganizationId &&
    accessibleOrganizationIds.includes(preferredOrganizationId)
  ) {
    return preferredOrganizationId
  }

  if (
    user?.currentOrganizationId &&
    accessibleOrganizationIds.includes(user.currentOrganizationId)
  ) {
    return user.currentOrganizationId
  }

  if (
    user?.organizationId &&
    accessibleOrganizationIds.includes(user.organizationId)
  ) {
    return user.organizationId
  }

  return accessibleOrganizationIds[0] || null
}

function normalizeUserProfile(user, preferredOrganizationId = null) {
  if (!user) return null

  const currentOrganizationId = resolveCurrentOrganizationId(
    user,
    preferredOrganizationId
  )
  const currentMembership = getMembershipForOrganization(
    user,
    currentOrganizationId
  )
  const organizationIds = getAccessibleOrganizationIds(user)

  return {
    ...user,
    organizationIds,
    currentOrganizationId,
    organizationId: currentOrganizationId,
    memberships: Array.isArray(user.memberships)
      ? user.memberships.map(normalizeMembership)
      : [],
    currentMembership,
    role: currentMembership?.role || null,
    active: currentMembership ? currentMembership.active !== false : true,
    allowedDeviceIds: currentMembership?.allowedDeviceIds || [],
  }
}

function buildMembership({
  organizationId,
  role = 'user',
  active = true,
  allowedDeviceIds = [],
}) {
  return normalizeMembership({
    organizationId,
    role,
    active,
    allowedDeviceIds,
  })
}

function upsertMembership(user, membership) {
  const memberships = Array.isArray(user.memberships)
    ? [...user.memberships]
    : []
  const normalized = normalizeMembership(membership)
  const index = memberships.findIndex(
    (item) => item.organizationId === normalized.organizationId
  )

  if (index >= 0) {
    memberships[index] = {
      ...memberships[index],
      ...normalized,
    }
  } else {
    memberships.push(normalized)
  }

  return memberships
}

async function saveMembershipPatch(userId, organizationId, membershipPatch) {
  const user = await getUserById(userId)
  if (!user) return null

  const currentMembership =
    getMembershipForOrganization(user, organizationId) ||
    buildMembership({ organizationId })

  const nextMembership = normalizeMembership({
    ...currentMembership,
    ...membershipPatch,
    organizationId,
  })

  const nextMemberships = upsertMembership(user, nextMembership)
  const nextOrganizationIds = uniqueStrings([
    ...getAccessibleOrganizationIds(user),
    organizationId,
  ])

  return updateUserById(userId, {
    memberships: nextMemberships,
    organizationIds: nextOrganizationIds,
    currentOrganizationId:
      user.currentOrganizationId || organizationId,
  })
}

async function patchCurrentOrganization(userId, organizationId) {
  const user = await getUserById(userId)
  if (!user) return null

  const accessibleOrganizationIds = getAccessibleOrganizationIds(user)
  if (!accessibleOrganizationIds.includes(organizationId)) {
    return null
  }

  const updated = await updateUserById(userId, {
    currentOrganizationId: organizationId,
  })

  return normalizeUserProfile(updated, organizationId)
}

const seedData = [
  {
    userId: 'user123',
    name: 'Harry Potter',
    email: 'harry@example.com',
    active: true,
    organizationIds: ['default-org'],
    currentOrganizationId: 'default-org',
    memberships: [
      {
        organizationId: 'default-org',
        role: 'admin',
        active: true,
        allowedDeviceIds: ['fan-1'],
      },
    ],
    cards: [
      {
        uid: 'A27A7B38',
        status: 'active',
      },
      {
        uid: 'B12C44D9',
        status: 'lost',
      },
    ],
  },
]

async function getUsers(limit = 50) {
  const users = await listUsers(limit)
  return users.map((user) => normalizeUserProfile(user))
}

async function getUsersForOrganization(organizationId, limit = 50) {
  const users = await listUsersByOrganization(organizationId, limit)
  return users.map((user) => normalizeUserProfile(user, organizationId))
}

async function seedUsers() {
  for (const user of seedData) {
    await upsertUser(user)
  }

  return seedData
}

async function findUserByUid(uid) {
  const user = await getUserByActiveCardUid(uid)
  return normalizeUserProfile(user)
}

async function findActiveUserByUid(uid) {
  const user = await getUserByActiveCardUid(uid)
  if (!user) return null

  const normalized = normalizeUserProfile(user)
  if (normalized.active !== true) return null

  return normalized
}

async function findActiveUserByUidForOrganization(uid, organizationId) {
  const user = await getUserByActiveCardUid(uid)
  if (!user) return null

  const normalized = normalizeUserProfile(user, organizationId)
  if (!normalized.currentMembership) return null
  if (normalized.active !== true) return null

  return normalized
}

async function findUserByAuthUid(authUid) {
  const user = await getUserByAuthUid(authUid)
  return normalizeUserProfile(user)
}

async function ensureAuthUserProfile({ authUid, email, name }) {
  const existing = await getUserByAuthUid(authUid)
  if (existing) {
    return normalizeUserProfile(existing)
  }

  const profile = {
    userId: authUid,
    authUid,
    email: email || null,
    name: name || null,
    organizationIds: [],
    currentOrganizationId: null,
    memberships: [],
    sessionDurationSec: 1800,
    cards: [],
  }

  await upsertUser(profile)
  const created = await getUserByAuthUid(authUid)
  return normalizeUserProfile(created)
}

async function patchUser(uid, patch) {
  const updated = await updateUserById(uid, patch)
  return normalizeUserProfile(updated)
}

async function patchUserAllowedDeviceIds(uid, organizationId, allowedDeviceIds) {
  const updated = await saveMembershipPatch(uid, organizationId, {
    allowedDeviceIds,
  })

  return normalizeUserProfile(updated, organizationId)
}

async function createUserAsAdmin(adminProfile, data) {
  const targetOrganizationId =
    data.organizationId || adminProfile.currentOrganizationId

  if (!targetOrganizationId) {
    throw new Error('ADMIN_ORGANIZATION_NOT_SET')
  }

  if (
    !getAccessibleOrganizationIds(adminProfile).includes(targetOrganizationId)
  ) {
    throw new Error('ORGANIZATION_ACCESS_DENIED')
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
    organizationIds: [targetOrganizationId],
    currentOrganizationId: targetOrganizationId,
    memberships: [
      buildMembership({
        organizationId: targetOrganizationId,
        role: data.role || 'user',
        active: data.active ?? true,
        allowedDeviceIds: Array.isArray(data.allowedDeviceIds)
          ? data.allowedDeviceIds
          : [],
      }),
    ],
    cards: Array.isArray(data.cards) ? data.cards : [],
    sessionDurationSec: data.sessionDurationSec || 1800,
  }

  await upsertUser(profile)
  const created = await getUserById(createdAuthUser.uid)
  return normalizeUserProfile(created, targetOrganizationId)
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

  const organizationId = adminProfile.currentOrganizationId
  if (!organizationId) {
    return {
      allowed: false,
      reason: 'ADMIN_ORGANIZATION_NOT_SET',
      user: targetUser,
    }
  }

  const targetMembership = getMembershipForOrganization(targetUser, organizationId)
  if (!targetMembership) {
    return {
      allowed: false,
      reason: 'DIFFERENT_ORGANIZATION',
      user: targetUser,
    }
  }

  return {
    allowed: true,
    reason: null,
    organizationId,
    user: normalizeUserProfile(targetUser, organizationId),
  }
}

async function patchUserAsAdmin(adminProfile, uid, patch) {
  const check = await assertSameOrganization(adminProfile, uid)
  if (!check.allowed) {
    return check
  }

  const globalPatch = {}
  const membershipPatch = {}

  if (patch.name !== undefined) globalPatch.name = patch.name
  if (patch.email !== undefined) globalPatch.email = patch.email
  if (patch.cards !== undefined) globalPatch.cards = patch.cards
  if (patch.sessionDurationSec !== undefined) {
    globalPatch.sessionDurationSec = patch.sessionDurationSec
  }

  if (patch.role !== undefined) membershipPatch.role = patch.role
  if (patch.active !== undefined) membershipPatch.active = patch.active

  if (Object.keys(globalPatch).length > 0) {
    await updateUserById(uid, globalPatch)
  }

  let updated = await getUserById(uid)

  if (Object.keys(membershipPatch).length > 0) {
    updated = await saveMembershipPatch(
      uid,
      check.organizationId,
      membershipPatch
    )
  }

  return {
    allowed: true,
    reason: null,
    user: normalizeUserProfile(updated, check.organizationId),
  }
}

async function patchUserAllowedDeviceIdsAsAdmin(
  adminProfile,
  uid,
  allowedDeviceIds
) {
  const check = await assertSameOrganization(adminProfile, uid)
  if (!check.allowed) {
    return check
  }

  const updated = await saveMembershipPatch(uid, check.organizationId, {
    allowedDeviceIds,
  })

  return {
    allowed: true,
    reason: null,
    user: normalizeUserProfile(updated, check.organizationId),
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
  getAccessibleOrganizationIds,
  getMembershipForOrganization,
  normalizeUserProfile,
  patchCurrentOrganization,
  getUsersForOrganization,
  createUserAsAdmin,
  patchUserAsAdmin,
  patchUserAllowedDeviceIdsAsAdmin,
  removeUserAsAdmin,
  getUsers,
  seedUsers,
  findUserByUid,
  findActiveUserByUid,
  findActiveUserByUidForOrganization,
  findUserByAuthUid,
  ensureAuthUserProfile,
  patchUser,
  patchUserAllowedDeviceIds,
  removeUser,
}
