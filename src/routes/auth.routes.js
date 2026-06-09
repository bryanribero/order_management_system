import { Router } from 'express'
import {
  loginController,
  logoutController,
  registerController,
} from '../controllers/auth.controller.js'
import { credentials } from '../validators/credentialsAuth.js'
import { validateFields } from '../middlewares/validateFields.js'
import { loginRateLimit, registerRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'

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

export default router
