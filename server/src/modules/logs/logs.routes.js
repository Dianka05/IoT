const express = require('express')
const { getRecentLogsByOrganization } = require('./logs.store.firestore')
const { sendSuccessResponse } = require('../../responses/default.response')
const { requireAuth } = require('../auth/auth.middleware')
const {
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
} = require('../auth/role.middleware')

const router = express.Router()

router.get('/logs', requireAuth, requireUserProfile, requireOperationsRole, requireOrganizationContext, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 20)
    const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit

    const logs = await getRecentLogsByOrganization(
      req.userProfile.currentOrganizationId,
      limit
    )

    sendSuccessResponse(res, {
      items: logs,
      count: logs.length,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
