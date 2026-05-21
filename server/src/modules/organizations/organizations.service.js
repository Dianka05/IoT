const {
  createOrganization,
  getOrganizationById,
  listOrganizations,
} = require('./organizations.store.firestore')

async function addOrganization(data) {
  return createOrganization({
    organizationId: data.organizationId,
    name: data.name,
    active: data.active ?? true,
  })
}

async function getOrganization(organizationId) {
  return getOrganizationById(organizationId)
}

async function getOrganizations(limit = 50) {
  return listOrganizations(limit)
}

module.exports = {
  addOrganization,
  getOrganization,
  getOrganizations,
}