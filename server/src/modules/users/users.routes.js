const express = require('express')
const router = express.Router()

const {
  getUsers,
  seedUsers,
  findUserByUid,
} = require('./users.service')


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

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

module.exports = router