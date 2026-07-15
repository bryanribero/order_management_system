import { Router } from 'express'
import { orderRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createOrderValidator,
  statusOrderValidator,
} from '../validators/orders.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  createOrderController,
  getOrdersController,
} from '../controllers/orders.controller.js'
import { paginationValidator } from '../validators/request.validator.js'

const router = Router()

router.post(
  '/',
  orderRateLimit,
  verifyAccessToken,
  createOrderValidator,
  validateFields,
  createOrderController
)

router.get(
  '/',
  orderRateLimit,
  verifyAccessToken,
  paginationValidator,
  statusOrderValidator,
  validateFields,
  getOrdersController
)

export default router
