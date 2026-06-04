import { Router } from 'express'
import { registerController } from '../controllers/auth.controller.js'
import { credentials } from '../validators/credentialsAuth.js'
import { validateFields } from '../middlewares/validateFields.js'
import { registerRateLimit } from '../middlewares/rate.js'

const router = Router()

router.post(
  '/register',
  registerRateLimit,
  credentials,
  validateFields,
  registerController
)

export default router
