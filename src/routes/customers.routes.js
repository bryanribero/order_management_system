import { Router } from 'express'
import { customerRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  bodyCustomerValidate,
  bodyUpdateCustomerValidate,
} from '../validators/customers.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  createCustomerController,
  getCustomerByIdController,
  getCustomersController,
  updateCustomerByIdController,
} from '../controllers/customers.controller.js'
import {
  paginationValidator,
  paramsValidator,
} from '../validators/request.validator.js'

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

router.get(
  '/:id',
  customerRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  getCustomerByIdController
)

router.patch(
  '/:id',
  customerRateLimit,
  verifyAccessToken,
  paramsValidator,
  bodyUpdateCustomerValidate,
  validateFields,
  updateCustomerByIdController
)

export default router
