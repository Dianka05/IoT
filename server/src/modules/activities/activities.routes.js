const express = require('express')
const { Errors } = require('ds-express-errors')
const {
  getActivities,
  getActivity,
} = require('./activities.service')
const { sendSuccessResponse } = require('../../responses/default.response')
const { requireAuth } = require('../auth/auth.middleware')
const {
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
} = require('../auth/role.middleware')

const router = express.Router()

router.get('/activities', requireAuth, requireUserProfile, requireOperationsRole, requireOrganizationContext, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit
    const { type, entityId, activityType } = req.query

    const items = await getActivities({
      type: type || undefined,
      entityId: entityId || undefined,
      activityType: activityType || undefined,
      organizationId: req.userProfile.currentOrganizationId,
      limit,
    })

    sendSuccessResponse(res, {
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/activities/:docId', requireAuth, requireUserProfile, requireOperationsRole, requireOrganizationContext, async (req, res, next) => {
  try {
    const item = await getActivity(req.params.docId)

    if (!item) {
      return next(Errors.NotFound('Activity not found'))
    }

    if (item.organizationId !== req.userProfile.currentOrganizationId) {
      return next(Errors.Forbidden('Cannot access activity from another organization'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

module.exports = router
