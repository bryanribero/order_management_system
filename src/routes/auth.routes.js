import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from '../controllers/auth.controller.js'
import { credentials } from '../validators/credentialsAuth.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  loginRateLimit,
  refreshRateLimit,
  registerRateLimit,
} from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { verifyRefreshToken } from '../middlewares/verifyRefreshToken.js'

const router = Router()

router.post(
  '/register',
  registerRateLimit,
  credentials,
  validateFields,
  registerController
)

router.post(
  '/login',
  loginRateLimit,
  credentials,
  validateFields,
  loginController
)

router.post('/logout', verifyAccessToken, logoutController)

router.post('/refresh', refreshRateLimit, verifyRefreshToken, refreshController)

export default router
