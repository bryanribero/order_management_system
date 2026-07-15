import { Router } from 'express'
import { orderRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createOrderValidator,
  statusOrderValidator,
  updateStatusOrderValidator,
} from '../validators/orders.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  createOrderController,
  getOrderByIdController,
  getOrdersController,
  statusUpdateOrderController,
} from '../controllers/orders.controller.js'
import {
  paginationValidator,
  paramsValidator,
} from '../validators/request.validator.js'

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

router.get(
  '/:id',
  orderRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  getOrderByIdController
)

router.patch(
  '/status/:id',
  orderRateLimit,
  verifyAccessToken,
  paramsValidator,
  updateStatusOrderValidator,
  validateFields,
  statusUpdateOrderController
)

export default router
