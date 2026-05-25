const express = require('express')
const { Errors } = require('ds-express-errors')
const { requireAuth } = require('../auth/auth.middleware')
const { requireUserProfile } = require('../auth/role.middleware')
const {
  createOrganizationForUser,
  getOrganization,
  getOrganizationsForUser,
} = require('./organizations.service')
const { patchCurrentOrganization } = require('../users/users.service')

const router = express.Router()

router.post('/organizations', requireAuth, requireUserProfile, async (req, res, next) => {
  try {
    const { organizationId, name, active } = req.body || {}

    if (!organizationId || typeof organizationId !== 'string') {
      return next(Errors.BadRequest('`organizationId` must be a non-empty string'))
    }

    if (!name || typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a non-empty string'))
    }

    const canCreate =
      req.userProfile.role === 'admin' ||
      !Array.isArray(req.userProfile.organizationIds) ||
      req.userProfile.organizationIds.length === 0

    if (!canCreate) {
      return next(Errors.Forbidden('Only admin can create organizations'))
    }

    const result = await createOrganizationForUser(req.userProfile, {
      organizationId,
      name,
      active,
    })

    res.json({
      success: true,
      item: result.organization,
      profile: result.profile,
    })
  } catch (err) {
    if (err.message === 'ORGANIZATION_ALREADY_EXISTS') {
      return next(Errors.Conflict('Organization already exists'))
    }

    next(err)
  }
})

router.get('/organizations', requireAuth, requireUserProfile, async (req, res, next) => {
  try {
    const items = await getOrganizationsForUser(req.userProfile)

    res.json({
      success: true,
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/organizations/:organizationId', requireAuth, requireUserProfile, async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId

    if (!req.userProfile.organizationIds.includes(organizationId)) {
      return next(Errors.Forbidden('Cannot access organization'))
    }

    const item = await getOrganization(organizationId)

    if (!item) {
      return next(Errors.NotFound('Organization not found'))
    }

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    next(err)
  }
})

router.patch('/organizations/current', requireAuth, requireUserProfile, async (req, res, next) => {
  try {
    const { organizationId } = req.body || {}

    if (!organizationId || typeof organizationId !== 'string') {
      return next(Errors.BadRequest('`organizationId` must be a non-empty string'))
    }

    const updatedProfile = await patchCurrentOrganization(
      req.userProfile.userId,
      organizationId
    )

    if (!updatedProfile) {
      return next(Errors.Forbidden('Cannot switch to this organization'))
    }

    res.json({
      success: true,
      item: updatedProfile,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
