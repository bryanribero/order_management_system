import { Router } from 'express'
import { courierRateLimit } from '../middlewares/rate.js'
import {
  bodyCourierValidator,
  bodyUpdateCourierValidator,
} from '../validators/couriers.validator.js'
import {
  paginationValidator,
  paramsValidator,
} from '../validators/request.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createCourierController,
  getCourierByIdController,
  getCouriersController,
  updateCourierByIdController,
} from '../controllers/couriers.controller.js'

const router = Router()

router.post(
  '/',
  courierRateLimit,
  verifyAccessToken,
  bodyCourierValidator,
  validateFields,
  createCourierController
)

router.get(
  '/',
  courierRateLimit,
  verifyAccessToken,
  paginationValidator,
  validateFields,
  getCouriersController
)

router.get(
  '/:id',
  courierRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  getCourierByIdController
)

router.patch(
  '/:id',
  courierRateLimit,
  verifyAccessToken,
  paramsValidator,
  bodyUpdateCourierValidator,
  validateFields,
  updateCourierByIdController
)

export default router
