import { Router } from 'express'
import { customerRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { bodyCustomerValidate } from '../validators/customers.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  createCustomerController,
  getCustomersController,
} from '../controllers/customers.controller.js'
import { paginationValidator } from '../validators/request.validator.js'

const router = Router()

router.post(
  '/',
  customerRateLimit,
  verifyAccessToken,
  bodyCustomerValidate,
  validateFields,
  createCustomerController
)

router.get(
  '/',
  customerRateLimit,
  verifyAccessToken,
  paginationValidator,
  validateFields,
  getCustomersController
)

export default router
