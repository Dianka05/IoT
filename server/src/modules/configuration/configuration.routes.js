const express = require('express')

const { sendSuccessResponse } = require('../../responses/default.response')
const { requireAuth } = require('../auth/auth.middleware')
const {
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
} = require('../auth/role.middleware')
const {
  getConfigurationForOrganization,
  saveConfigurationForOrganization,
} = require('./configuration.service')

const router = express.Router()

router.get(
  '/configuration/security',
  requireAuth,
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
  async (req, res, next) => {
    try {
      const item = await getConfigurationForOrganization(
        req.userProfile.currentOrganizationId
      )

      sendSuccessResponse(res, { item })
    } catch (err) {
      next(err)
    }
  }
)

router.put(
  '/configuration/security',
  requireAuth,
  requireUserProfile,
  requireOperationsRole,
  requireOrganizationContext,
  async (req, res, next) => {
    try {
      const item = await saveConfigurationForOrganization(
        req.userProfile.currentOrganizationId,
        req.body || {}
      )

      sendSuccessResponse(res, { item })
    } catch (err) {
      next(err)
    }
  }
)

module.exports = router
