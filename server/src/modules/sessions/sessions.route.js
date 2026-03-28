const express = require('express')
const router = express.Router()

router.get('/sessions', (req, res) => {
  res.json({ success: true, items: [] })
})

module.exports = router
