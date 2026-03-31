const express = require('express')
const router = express.Router()

const {
  getUsers,
  seedUsers,
  findUserByUid,
} = require('./users.service')

router.get('/users', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const items = await getUsers(limit)

    res.json({
      success: true,
      items,
      count: items.length,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/users/seed', async (req, res, next) => {
  try {
    const items = await seedUsers()

    res.json({
      success: true,
      seeded: true,
      count: items.length,
      items,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/users/by-uid/:uid', async (req, res, next) => {
  try {
    const item = await findUserByUid(req.params.uid)

    res.json({
      success: true,
      item,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router