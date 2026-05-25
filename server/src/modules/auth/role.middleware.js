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

    if (profile.currentMembership && profile.active !== true) {
      return next(Errors.Forbidden('User is inactive in the current organization'))
    }

    req.userProfile = profile
    next()
  } catch (err) {
    next(err)
  }
}

async function ensureProfile(req) {
  if (req.userProfile) return req.userProfile

  const profile = await findUserByAuthUid(req.auth.uid)
  if (!profile) {
    return null
  }

  req.userProfile = profile
  return profile
}

async function requireOrganizationContext(req, res, next) {
  try {
    const profile = await ensureProfile(req)

    if (!profile) {
      return next(Errors.Forbidden('User profile not found'))
    }

    if (!profile.currentOrganizationId) {
      return next(Errors.Forbidden('Current organization is not set'))
    }

    next()
  } catch (err) {
    next(err)
  }
}

async function requireAdmin(req, res, next) {
  try {
    const profile = await ensureProfile(req)

    if (!profile) {
      return next(Errors.Forbidden('User profile not found'))
    }

    if (!profile.currentOrganizationId) {
      return next(Errors.Forbidden('Current organization is not set'))
    }

    if (profile.role !== 'admin') {
      return next(Errors.Forbidden('Admin role required'))
    }

    next()
  } catch (err) {
    next(err)
  }
}

async function requireOperationsRole(req, res, next) {
  try {
    const profile = await ensureProfile(req)

    if (!profile) {
      return next(Errors.Forbidden('User profile not found'))
    }

    if (!profile.currentOrganizationId) {
      return next(Errors.Forbidden('Current organization is not set'))
    }

    if (profile.role !== 'admin' && profile.role !== 'technician') {
      return next(Errors.Forbidden('Operations role required'))
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = {
  requireUserProfile,
  requireOrganizationContext,
  requireAdmin,
  requireOperationsRole,
}
