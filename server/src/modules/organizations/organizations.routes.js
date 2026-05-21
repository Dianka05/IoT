const express = require('express')
const { Errors } = require('ds-express-errors')
const { requireAuth } = require('../auth/auth.middleware')
const { requireAdmin } = require('../auth/role.middleware')
const {
  addOrganization,
  getOrganization,
  getOrganizations,
} = require('./organizations.service')

const router = express.Router()

router.post('/organizations', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { organizationId, name, active } = req.body || {}

    if (!organizationId || typeof organizationId !== 'string') {
      return next(Errors.BadRequest('`organizationId` must be a non-empty string'))
    }

    if (!name || typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a non-empty string'))
    }

    const item = await addOrganization({
      organizationId,
      name,
      active,
    })

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    if (err.message === 'ORGANIZATION_ALREADY_EXISTS') {
      return next(Errors.Conflict('Organization already exists'))
    }

    next(err)
  }
})

router.get('/organizations', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getOrganizations(limit)

    res.json({
      success: true,
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/organizations/:organizationId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await getOrganization(req.params.organizationId)

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

module.exports = router