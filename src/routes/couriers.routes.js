import { Router } from 'express'
import { courierRateLimit } from '../middlewares/rate.js'
import {
  bodyValidator,
  paginationCourierValidator,
} from '../validators/couriers.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createCourierController,
  getCouriersController,
} from '../controllers/couriers.controller.js'

const router = Router()

router.post(
  '/',
  courierRateLimit,
  verifyAccessToken,
  bodyValidator,
  validateFields,
  createCourierController
)

router.get(
  '/',
  courierRateLimit,
  verifyAccessToken,
  paginationCourierValidator,
  validateFields,
  getCouriersController
)

export default router
