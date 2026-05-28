const express = require('express')
const { checkIdentifierNumber } = require('./customerIdentifierNumbers.service')

const router = express.Router()

router.get('/customer-identifier-numbers/:identifierNumber', async (req, res, next) => {
  try {
    const result = await checkIdentifierNumber(req.params.identifierNumber)

    res.json({
      success: true,
      item: result,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router