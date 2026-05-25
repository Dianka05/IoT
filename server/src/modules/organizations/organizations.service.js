const {
  createOrganization,
  getOrganizationById,
  listOrganizations,
  listOrganizationsByIds,
} = require('./organizations.store.firestore')
const {
  getAccessibleOrganizationIds,
  patchUser,
} = require('../users/users.service')

function uniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value)))]
}

async function addOrganization(data) {
  return createOrganization({
    organizationId: data.organizationId,
    name: data.name,
    active: data.active ?? true,
    createdByUserId: data.createdByUserId || null,
    ownerUserIds: Array.isArray(data.ownerUserIds) ? data.ownerUserIds : [],
  })
}

async function createOrganizationForUser(userProfile, data) {
  const item = await addOrganization({
    organizationId: data.organizationId,
    name: data.name,
    active: data.active,
    createdByUserId: userProfile.userId,
    ownerUserIds: uniqueStrings([
      ...(Array.isArray(data.ownerUserIds) ? data.ownerUserIds : []),
      userProfile.userId,
    ]),
  })

  const targetOrganizationId = item.organizationId || item.id
  const nextOrganizationIds = uniqueStrings([
    ...getAccessibleOrganizationIds(userProfile),
    targetOrganizationId,
  ])

  const currentMemberships = Array.isArray(userProfile.memberships)
    ? [...userProfile.memberships]
    : []

  const existingMembershipIndex = currentMemberships.findIndex(
    (membership) => membership.organizationId === targetOrganizationId
  )

  const adminMembership = {
    organizationId: targetOrganizationId,
    role: 'admin',
    active: true,
    allowedDeviceIds: [],
  }

  if (existingMembershipIndex >= 0) {
    currentMemberships[existingMembershipIndex] = {
      ...currentMemberships[existingMembershipIndex],
      ...adminMembership,
    }
  } else {
    currentMemberships.push(adminMembership)
  }

  const profile = await patchUser(userProfile.userId, {
    organizationIds: nextOrganizationIds,
    currentOrganizationId: targetOrganizationId,
    memberships: currentMemberships,
  })

  return {
    organization: item,
    profile,
  }
}

async function getOrganization(organizationId) {
  return getOrganizationById(organizationId)
}

async function getOrganizations(limit = 50) {
  return listOrganizations(limit)
}

async function getOrganizationsForUser(userProfile) {
  const ids = getAccessibleOrganizationIds(userProfile)
  return listOrganizationsByIds(ids)
}

module.exports = {
  addOrganization,
  createOrganizationForUser,
  getOrganization,
  getOrganizations,
  getOrganizationsForUser,
}
