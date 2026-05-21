const { Errors } = require('ds-express-errors')
const { findUserByAuthUid } = require('../users/users.service')

async function requireUserProfile(req, res, next) {
  try {
    if (!req.auth || !req.auth.uid) {
      return next(Errors.Unauthorized('Authentication required'))
    }

    const profile = await findUserByAuthUid(req.auth.uid)

    if (!profile) {
      return next(Errors.Forbidden('User profile not found'))
    }

    if (profile.active !== true) {
      return next(Errors.Forbidden('User is inactive'))
    }

    req.userProfile = profile
    next()
  } catch (err) {
    next(err)
  }
}

async function requireAdmin(req, res, next) {
  try {
    if (!req.userProfile) {
      const profile = await findUserByAuthUid(req.auth.uid)

      if (!profile) {
        return next(Errors.Forbidden('User profile not found'))
      }

      req.userProfile = profile
    }

    if (req.userProfile.role !== 'admin') {
      return next(Errors.Forbidden('Admin role required'))
    }

    if (!req.userProfile.organizationId) {
      return next(Errors.Forbidden('Admin organization is not set'))
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = {
  requireUserProfile,
  requireAdmin,
}