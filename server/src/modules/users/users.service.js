const { auth } = require('../../integrations/firebase/firebase.client')
const {
  upsertUser,
  listUsers,
  listUsersByOrganization,
  getUserByCardUid,
  getUserByActiveCardUid,
  getUserByAuthUid,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('./users.store.firestore')
const { getDeviceById } = require('../devices/fan-1/devices.store.firestore')

function uniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value)))]
}

function normalizeCard(card = {}) {
  const uid = String(card.uid || '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toUpperCase()

  if (!uid) {
    return null
  }

  return {
    uid,
    status: String(card.status || 'active').toLowerCase(),
  }
}

function normalizeCards(cards = []) {
  const seen = new Set()
  const normalized = []

  for (const rawCard of Array.isArray(cards) ? cards : []) {
    const card = normalizeCard(rawCard)

    if (!card || seen.has(card.uid)) {
      continue
    }

    seen.add(card.uid)
    normalized.push(card)
  }

  return normalized
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
    mustChangePassword: user.mustChangePassword === true,
    cards: normalizeCards(user.cards),
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

async function assertAllowedDevicesInOrganization(organizationId, allowedDeviceIds = []) {
  for (const deviceId of uniqueStrings(allowedDeviceIds)) {
    const device = await getDeviceById(deviceId)

    if (!device) {
      throw new Error(`DEVICE_NOT_FOUND:${deviceId}`)
    }

    if (device.organizationId !== organizationId) {
      throw new Error(`DEVICE_OUTSIDE_ORGANIZATION:${deviceId}`)
    }
  }
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

async function getUserByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) {
    return null
  }

  try {
    const authUser = await auth.getUserByEmail(normalizedEmail)
    const existingProfile = await getUserByAuthUid(authUser.uid)

    if (existingProfile) {
      return existingProfile
    }

    const profile = {
      userId: authUser.uid,
      authUid: authUser.uid,
      email: authUser.email || normalizedEmail,
      name: authUser.displayName || null,
      mustChangePassword: false,
      organizationIds: [],
      currentOrganizationId: null,
      memberships: [],
      sessionDurationSec: 1800,
      cards: [],
    }

    await upsertUser(profile)
    return getUserByAuthUid(authUser.uid)
  } catch (err) {
    if (err?.code === 'auth/user-not-found') {
      return null
    }

    throw err
  }
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

async function findUserCardAccessForOrganization(uid, organizationId) {
  const user = await getUserByCardUid(uid)
  if (!user) return null

  const normalized = normalizeUserProfile(user, organizationId)
  if (!normalized.currentMembership) {
    return null
  }

  const normalizedUid = String(uid || '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toUpperCase()
  const card = normalizeCards(user.cards).find((item) => item.uid === normalizedUid)
  if (!card) {
    return null
  }

  return {
    user: normalized,
    card,
  }
}

async function findUserByAuthUid(authUid) {
  const user = await getUserByAuthUid(authUid)
  return normalizeUserProfile(user)
}

async function ensureAuthUserProfile({ authUid, email, name, customerIdentifierNumber, }) {
  const existing = await getUserByAuthUid(authUid)
  if (existing) {
    return normalizeUserProfile(existing)
  }

  const profile = {
    userId: authUid,
    authUid,
    email: email || null,
    name: name || null,
    customerIdentifierNumber: customerIdentifierNumber || null,
    mustChangePassword: false,
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
  await assertAllowedDevicesInOrganization(organizationId, allowedDeviceIds)

  const updated = await saveMembershipPatch(uid, organizationId, {
    allowedDeviceIds,
  })

  return normalizeUserProfile(updated, organizationId)
}

async function createUserAsAdmin(adminProfile, data) {
  const targetOrganizationId =
    data.organizationId || adminProfile.currentOrganizationId
  const normalizedEmail = String(data.email || '').trim().toLowerCase()

  if (!targetOrganizationId) {
    throw new Error('ADMIN_ORGANIZATION_NOT_SET')
  }

  if (
    !getAccessibleOrganizationIds(adminProfile).includes(targetOrganizationId)
  ) {
    throw new Error('ORGANIZATION_ACCESS_DENIED')
  }

  const normalizedAllowedDeviceIds = Array.isArray(data.allowedDeviceIds)
    ? uniqueStrings(data.allowedDeviceIds)
    : []

  await assertAllowedDevicesInOrganization(
    targetOrganizationId,
    normalizedAllowedDeviceIds
  )

  const existingUser = await getUserByEmail(normalizedEmail)
  if (existingUser) {
    const existingCards = normalizeCards(existingUser.cards)
    const nextCards = normalizeCards([
      ...existingCards,
      ...normalizeCards(data.cards),
    ])
    const existingOrganizations = getAccessibleOrganizationIds(existingUser)
    const nextOrganizationIds = uniqueStrings([
      ...existingOrganizations,
      targetOrganizationId,
    ])
    const updatedMemberships = upsertMembership(existingUser, buildMembership({
      organizationId: targetOrganizationId,
      role: data.role || 'user',
      active: data.active ?? true,
      allowedDeviceIds: normalizedAllowedDeviceIds,
    }))
    const globalPatch = {
      organizationIds: nextOrganizationIds,
      memberships: updatedMemberships,
      cards: nextCards,
      updatedAt: undefined,
    }

    if (!existingUser.currentOrganizationId) {
      globalPatch.currentOrganizationId = targetOrganizationId
    }

    if ((!existingUser.name || !String(existingUser.name).trim()) && data.name) {
      globalPatch.name = data.name
      await auth.updateUser(existingUser.authUid || existingUser.userId, {
        displayName: data.name,
      })
    }

    if (
      (!Number.isFinite(Number(existingUser.sessionDurationSec)) ||
        Number(existingUser.sessionDurationSec) <= 0) &&
      data.sessionDurationSec
    ) {
      globalPatch.sessionDurationSec = data.sessionDurationSec
    }

    const patch = Object.fromEntries(
      Object.entries(globalPatch).filter(([, value]) => value !== undefined)
    )
    const updated = await updateUserById(existingUser.userId || existingUser.id, patch)
    return normalizeUserProfile(updated, targetOrganizationId)
  }

  if (!data.password || typeof data.password !== 'string' || !String(data.password).trim()) {
    throw new Error('PASSWORD_REQUIRED_FOR_NEW_USER')
  }

  const createdAuthUser = await auth.createUser({
    email: normalizedEmail,
    password: data.password,
    displayName: data.name || undefined,
  })

  const profile = {
    userId: createdAuthUser.uid,
    authUid: createdAuthUser.uid,
    email: normalizedEmail,
    name: data.name || null,
    mustChangePassword: true,
    organizationIds: [targetOrganizationId],
    currentOrganizationId: targetOrganizationId,
    memberships: [
      buildMembership({
        organizationId: targetOrganizationId,
        role: data.role || 'user',
        active: data.active ?? true,
        allowedDeviceIds: normalizedAllowedDeviceIds,
      }),
    ],
    cards: normalizeCards(data.cards),
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
  if (patch.cards !== undefined) globalPatch.cards = normalizeCards(patch.cards)
  if (patch.sessionDurationSec !== undefined) {
    globalPatch.sessionDurationSec = patch.sessionDurationSec
  }

  if (patch.role !== undefined) membershipPatch.role = patch.role
  if (patch.active !== undefined) membershipPatch.active = patch.active

  if (patch.name !== undefined || patch.email !== undefined) {
    const authPatch = {}

    if (patch.name !== undefined) {
      authPatch.displayName = patch.name || null
    }

    if (patch.email !== undefined) {
      authPatch.email = patch.email
    }

    await auth.updateUser(uid, authPatch)
  }

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

async function patchUserCardsAsOperations(profile, uid, cards) {
  const check = await assertSameOrganization(profile, uid)
  if (!check.allowed) {
    return check
  }

  const updated = await updateUserById(uid, {
    cards: normalizeCards(cards),
  })

  return {
    allowed: true,
    reason: null,
    user: normalizeUserProfile(updated, check.organizationId),
  }
}

async function listRfidCardsForOrganization(organizationId, limit = 200) {
  const users = await listUsersByOrganization(organizationId, limit)
  const items = []

  users.forEach((user) => {
    const normalizedUser = normalizeUserProfile(user, organizationId)
    const cards = normalizeCards(user.cards)

    cards.forEach((card, index) => {
      items.push({
        id: `${normalizedUser.userId || normalizedUser.id}-${card.uid}-${index}`,
        uid: card.uid,
        status: card.status,
        userId: normalizedUser.userId || normalizedUser.id,
        authUid: normalizedUser.authUid || normalizedUser.userId || normalizedUser.id,
        userName: normalizedUser.name || normalizedUser.email || 'Unnamed User',
        email: normalizedUser.email || '',
        role: normalizedUser.role || 'user',
        active: normalizedUser.active !== false,
      })
    })
  })

  return items.sort((a, b) => String(a.uid).localeCompare(String(b.uid)))
}

async function patchRfidCardStatusForOrganization(
  profile,
  userId,
  cardUid,
  status
) {
  const check = await assertSameOrganization(profile, userId)
  if (!check.allowed) {
    return check
  }

  const nextStatus = String(status || '').toLowerCase()
  if (nextStatus !== 'active' && nextStatus !== 'blocked') {
    throw new Error('INVALID_CARD_STATUS')
  }

  const normalizedCardUid = String(cardUid || '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toUpperCase()

  const currentCards = normalizeCards(check.user.cards)
  const cardExists = currentCards.some((card) => card.uid === normalizedCardUid)

  if (!cardExists) {
    return {
      allowed: false,
      reason: 'CARD_NOT_FOUND',
      user: check.user,
    }
  }

  const updatedCards = currentCards.map((card) =>
    card.uid === normalizedCardUid
      ? {
          ...card,
          status: nextStatus,
        }
      : card
  )

  const updated = await updateUserById(userId, {
    cards: updatedCards,
  })

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

  await assertAllowedDevicesInOrganization(
    check.organizationId,
    allowedDeviceIds
  )

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

  const targetUser = await getUserById(uid)
  if (!targetUser) {
    return {
      allowed: false,
      reason: 'USER_NOT_FOUND',
      user: null,
    }
  }

  const organizationId = check.organizationId
  const nextMemberships = (Array.isArray(targetUser.memberships) ? targetUser.memberships : [])
    .filter((membership) => membership.organizationId !== organizationId)
    .map(normalizeMembership)
  const nextOrganizationIds = uniqueStrings(
    getAccessibleOrganizationIds(targetUser).filter((item) => item !== organizationId)
  )

  if (nextOrganizationIds.length === 0) {
    await deleteUserById(uid)

    try {
      await auth.deleteUser(uid)
    } catch (err) {
      console.error('Failed to delete Firebase Auth user:', err)
    }
  } else {
    const nextCurrentOrganizationId =
      targetUser.currentOrganizationId === organizationId
        ? nextOrganizationIds[0]
        : targetUser.currentOrganizationId

    await updateUserById(uid, {
      memberships: nextMemberships,
      organizationIds: nextOrganizationIds,
      currentOrganizationId: nextCurrentOrganizationId || null,
    })
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

async function clearMustChangePassword(authUid) {
  const user = await getUserByAuthUid(authUid)
  if (!user) return null

  const updated = await updateUserById(user.userId || user.id || authUid, {
    mustChangePassword: false,
  })

  return normalizeUserProfile(updated)
}

module.exports = {
  getAccessibleOrganizationIds,
  getMembershipForOrganization,
  normalizeUserProfile,
  patchCurrentOrganization,
  getUsersForOrganization,
  listRfidCardsForOrganization,
  createUserAsAdmin,
  patchUserAsAdmin,
  patchUserCardsAsOperations,
  patchUserAllowedDeviceIdsAsAdmin,
  patchRfidCardStatusForOrganization,
  removeUserAsAdmin,
  getUsers,
  seedUsers,
  findUserByUid,
  findActiveUserByUid,
  findActiveUserByUidForOrganization,
  findUserCardAccessForOrganization,
  findUserByAuthUid,
  ensureAuthUserProfile,
  getUserByEmail,
  clearMustChangePassword,
  patchUser,
  patchUserAllowedDeviceIds,
  removeUser,
}
