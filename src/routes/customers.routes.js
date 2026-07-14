import { Router } from 'express'
import { customerRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { bodyCustomerValidate } from '../validators/customers.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import { createCustomerController } from '../controllers/customers.controller.js'

const router = Router()

router.post(
  '/',
  customerRateLimit,
  verifyAccessToken,
  bodyCustomerValidate,
  validateFields,
  createCustomerController
)

export default router
