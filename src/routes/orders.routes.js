import { Router } from 'express'
import { orderRateLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { createOrderValidator } from '../validators/orders.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import { createOrderController } from '../controllers/orders.controller.js'

const router = Router()

router.post(
  '/',
  orderRateLimit,
  verifyAccessToken,
  createOrderValidator,
  validateFields,
  createOrderController
)

export default router
