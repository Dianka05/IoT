const express = require('express')
const router = express.Router()
const { Errors } = require('ds-express-errors')
const { requireAuth } = require('../auth/auth.middleware')
const { requireAdmin } = require('../auth/role.middleware')

const {
  getUsers,
  seedUsers,
  findUserByUid,
  patchUser,
  patchUserAllowedDeviceIds,
  removeUser,
  getUsersForOrganization,
  createUserAsAdmin,
  patchUserAsAdmin,
  patchUserAllowedDeviceIdsAsAdmin,
  removeUserAsAdmin,
} = require('./users.service')
const { sendSuccessResponse } = require('../../responses/default.response')


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Number of users to return
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 */
router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getUsersForOrganization(
      req.userProfile.organizationId,
      limit
    )

    res.json({
      success: true,
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})


/**
 * @swagger
 * /users/seed:
 *   post:
 *     summary: Seed users (dev/testing)
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Users seeded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersSeedResponse'
 */
router.post('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      role,
      active,
      allowedDeviceIds,
      cards,
      sessionDurationSec,
    } = req.body || {}

    if (!email || typeof email !== 'string') {
      return next(Errors.BadRequest('`email` must be a non-empty string'))
    }

    if (!password || typeof password !== 'string') {
      return next(Errors.BadRequest('`password` must be a non-empty string'))
    }

    if (name !== undefined && name !== null && typeof name !== 'string') {
      return next(Errors.BadRequest('`name` must be a string'))
    }

    if (role !== undefined && typeof role !== 'string') {
      return next(Errors.BadRequest('`role` must be a string'))
    }

    if (active !== undefined && typeof active !== 'boolean') {
      return next(Errors.BadRequest('`active` must be boolean'))
    }

    if (allowedDeviceIds !== undefined && !Array.isArray(allowedDeviceIds)) {
      return next(Errors.BadRequest('`allowedDeviceIds` must be an array'))
    }

    if (cards !== undefined && !Array.isArray(cards)) {
      return next(Errors.BadRequest('`cards` must be an array'))
    }

    const item = await createUserAsAdmin(req.userProfile, {
      email,
      password,
      name,
      role,
      active,
      allowedDeviceIds,
      cards,
      sessionDurationSec,
    })

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    next(err)
  }
})


/**
 * @swagger
 * /users/by-uid/{uid}:
 *   get:
 *     summary: Get user by UID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User UID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSingleResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users/by-uid/:uid', async (req, res, next) => {
  try {
    const item = await findUserByUid(req.params.uid)

    if (!item) {
      return next(Errors.NotFound('User not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

//--------------------------------

/**
 * @swagger
 * /users/{uid}:
 *   patch:
 *     summary: Update user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *               email:
 *                 type: string
 *               cards:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/users/:uid', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { uid } = req.params
    const { name, role, active, email, cards, sessionDurationSec } = req.body || {}

    const patch = {}

    if (name !== undefined) patch.name = name
    if (role !== undefined) patch.role = role
    if (active !== undefined) patch.active = active
    if (email !== undefined) patch.email = email
    if (cards !== undefined) patch.cards = cards
    if (sessionDurationSec !== undefined) patch.sessionDurationSec = sessionDurationSec

    if (Object.keys(patch).length === 0) {
      return next(Errors.BadRequest('No fields to update'))
    }

    const result = await patchUserAsAdmin(req.userProfile, uid, patch)

    if (result.reason === 'USER_NOT_FOUND') {
      return next(Errors.NotFound('User not found'))
    }

    if (result.reason === 'DIFFERENT_ORGANIZATION') {
      return next(Errors.Forbidden('Cannot modify user from another organization'))
    }

    if (!result.allowed) {
      return next(Errors.Forbidden(result.reason || 'Operation forbidden'))
    }

    res.json({
      success: true,
      item: result.user,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /users/{uid}/allowedDeviceIds:
 *   patch:
 *     summary: Update user allowed device ids
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - allowedDeviceIds
 *             properties:
 *               allowedDeviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [fan-1]
 *     responses:
 *       200:
 *         description: User allowed devices updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/users/:uid/allowedDeviceIds', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { uid } = req.params
    const { allowedDeviceIds } = req.body || {}

    if (!Array.isArray(allowedDeviceIds)) {
      return next(Errors.BadRequest('`allowedDeviceIds` must be an array'))
    }

    const result = await patchUserAllowedDeviceIdsAsAdmin(
      req.userProfile,
      uid,
      allowedDeviceIds
    )

    if (result.reason === 'USER_NOT_FOUND') {
      return next(Errors.NotFound('User not found'))
    }

    if (result.reason === 'DIFFERENT_ORGANIZATION') {
      return next(Errors.Forbidden('Cannot modify user from another organization'))
    }

    if (!result.allowed) {
      return next(Errors.Forbidden(result.reason || 'Operation forbidden'))
    }

    res.json({
      success: true,
      item: result.user,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /users/{uid}:
 *   delete:
 *     summary: Delete user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User identifier
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/users/:uid', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { uid } = req.params

    const result = await removeUserAsAdmin(req.userProfile, uid)

    if (result.reason === 'USER_NOT_FOUND') {
      return next(Errors.NotFound('User not found'))
    }

    if (result.reason === 'DIFFERENT_ORGANIZATION') {
      return next(Errors.Forbidden('Cannot delete user from another organization'))
    }

    if (!result.allowed) {
      return next(Errors.Forbidden(result.reason || 'Operation forbidden'))
    }

    res.json({
      success: true,
      deleted: true,
      id: uid,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
