import { Router } from 'express'
import { registerController } from '../controllers/auth.controller.js'
import { creatUserValidation } from '../validators/registerValidation.js'
import { validateFields } from '../middlewares/validateFields.js'
import { registerRateLimit } from '../middlewares/rate.js'

const router = Router()

router.post(
  '/register',
  registerRateLimit,
  creatUserValidation,
  validateFields,
  registerController
)

export default router
