const express = require('express')
const router = express.Router()
const { Errors } = require('ds-express-errors')

const {
  getUsers,
  seedUsers,
  findUserByUid,
  patchUser,
  patchUserAllowedDeviceIds,
  removeUser,
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
router.get('/users', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getUsers(limit)

    sendSuccessResponse(res, {
      items,
      count: items.length
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
router.post('/users/seed', async (req, res, next) => {
  try {
    const items = await seedUsers()

    sendSuccessResponse(res, {
      seeded: true,
      count: items.length,
      items,
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
router.patch('/users/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params
    const { name, role, active, email, cards } = req.body || {}

    const patch = {}

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return next(Errors.BadRequest('`name` must be a string'))
      }
      patch.name = name
    }

    if (role !== undefined) {
      if (typeof role !== 'string') {
        return next(Errors.BadRequest('`role` must be a string'))
      }
      patch.role = role
    }

    if (active !== undefined) {
      if (typeof active !== 'boolean') {
        return next(Errors.BadRequest('`active` must be boolean'))
      }
      patch.active = active
    }

    if (email !== undefined) {
      if (typeof email !== 'string') {
        return next(Errors.BadRequest('`email` must be a string'))
      }
      patch.email = email
    }

    if (cards !== undefined) {
      if (!Array.isArray(cards)) {
        return next(Errors.BadRequest('`cards` must be an array'))
      }
      patch.cards = cards
    }

    const item = await patchUser(uid, patch)

    if (!item) {
      return next(Errors.NotFound('User not found'))
    }

    sendSuccessResponse(res, item)
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
router.patch('/users/:uid/allowedDeviceIds', async (req, res, next) => {
  try {
    const { uid } = req.params
    const { allowedDeviceIds } = req.body || {}

    if (!Array.isArray(allowedDeviceIds)) {
      return next(Errors.BadRequest('`allowedDeviceIds` must be an array'))
    }

    const item = await patchUserAllowedDeviceIds(uid, allowedDeviceIds)

    if (!item) {
      return next(Errors.NotFound('User not found'))
    }

    sendSuccessResponse(res, item)
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
router.delete('/users/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params

    const deleted = await removeUser(uid)

    if (!deleted) {
      return next(Errors.NotFound('User not found'))
    }

    sendSuccessResponse(res, {}, 204)
  } catch (err) {
    next(err)
  }
})

module.exports = router
