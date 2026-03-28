const express = require('express')
const router = express.Router()

router.get('/users', (req, res) => {
  res.json({ success: true, items: [] })
})

module.exports = router