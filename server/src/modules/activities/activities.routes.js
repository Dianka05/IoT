const express = require('express')
const { Errors } = require('ds-express-errors')
const {
  getActivities,
  getActivity,
} = require('./activities.service')
const { sendSuccessResponse } = require('../../responses/default.response')

const router = express.Router()

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get activities
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Number of activities to return
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           example: box
 *         description: Filter by entity type
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *           example: main-1
 *         description: Filter by entity identifier
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *           example: status
 *         description: Filter by activity type
 *     responses:
 *       200:
 *         description: Activities fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/activities', async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit || 50)
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit

    const { type, entityId, activityType } = req.query

    const items = await getActivities({
      type: type || undefined,
      entityId: entityId || undefined,
      activityType: activityType || undefined,
      limit,
    })

    sendSuccessResponse(res, 
        {
            items,
            count: items.length,
        }
    )
    
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /activities/{docId}:
 *   get:
 *     summary: Get activity by id
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity document identifier
 *     responses:
 *       200:
 *         description: Activity fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Activity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/activities/:docId', async (req, res, next) => {
  try {
    const item = await getActivity(req.params.docId)

    if (!item) {
      return next(Errors.NotFound('Activity not found'))
    }

    sendSuccessResponse(res, item)
  } catch (err) {
    next(err)
  }
})

module.exports = router
