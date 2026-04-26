const express = require('express')
const { requireAuth } = require('./auth.middleware')
const {
  COOKIE_NAME,
  COOKIE_MAX_AGE_MS,
  registerUser,
  loginUser,
  createSessionCookie,
  getMeFromAuthUid,
} = require('./auth.service')
const { sendSuccessResponse } = require('../../responses/default.response')

const router = express.Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Secret123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation or Firebase auth error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {}

    const result = await registerUser({ email, password, name })
    const sessionCookie = await createSessionCookie(result.idToken)

    res.cookie(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    })

    sendSuccessResponse(res, {
        item: {
            profile: result.profile,
      },})
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Secret123!
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation or Firebase auth error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}

    const result = await loginUser({ email, password })
    const sessionCookie = await createSessionCookie(result.idToken)

    res.cookie(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    })

    sendSuccessResponse(res, {
      item: {
        profile: result.profile,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/auth/logout', async (req, res) => {
  res.clearCookie(COOKIE_NAME)
  sendSuccessResponse(res, {
    message: 'Logged out successfully',
  })
})

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/auth/me', requireAuth, async (req, res, next) => {
  try {
    const profile = await getMeFromAuthUid(req.auth.uid)

    sendSuccessResponse(res, {
      item: {
        auth: {
          uid: req.auth.uid,
          email: req.auth.email || null,
          emailVerified: req.auth.email_verified || false,
        },
        profile,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
