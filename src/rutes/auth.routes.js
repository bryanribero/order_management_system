import { Router } from 'express'
import {
  loginController,
  registerController,
} from '../controllers/auth.controller.js'
import { credentials } from '../validators/credentialsAuth.js'
import { validateFields } from '../middlewares/validateFields.js'
import { loginRateLimit, registerRateLimit } from '../middlewares/rate.js'

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

export default router
