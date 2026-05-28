const { Errors } = require('ds-express-errors')
const { findUserByAuthUid } = require('../users/users.service')

async function loadUserProfile(req) {
  if (!req.auth || !req.auth.uid) {
    return {
      error: Errors.Unauthorized('Authentication required'),
      profile: null,
    }
  }

  const profile = await findUserByAuthUid(req.auth.uid)
  if (!profile) {
    return {
      error: Errors.Forbidden('User profile not found'),
      profile: null,
    }
  }

  req.userProfile = profile

  return {
    error: null,
    profile,
  }
}

async function requireProfile(req, res, next) {
  try {
    const { error } = await loadUserProfile(req)
    if (error) {
      return next(error)
    }

    next()
  } catch (err) {
    next(err)
  }
}

async function requireUserProfile(req, res, next) {
  try {
    const { error, profile } = await loadUserProfile(req)
    if (error) {
      return next(error)
    }

    if (profile.currentMembership && profile.active !== true) {
      return next(Errors.Forbidden('User is inactive in the current organization'))
    }

    next()
  } catch (err) {
    next(err)
  }
}

async function ensureProfile(req) {
  if (req.userProfile) return req.userProfile

  const { profile } = await loadUserProfile(req)
  if (!profile) {
    return null
  }

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
  requireProfile,
  requireUserProfile,
  requireOrganizationContext,
  requireAdmin,
  requireOperationsRole,
}
