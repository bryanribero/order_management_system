import { Router } from 'express'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createProductsController,
  getUserProductsController,
} from '../controllers/products.controller.js'
import {
  createProductValidator,
  paginationProductValidator,
} from '../validators/products.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  createProductsRateLimit,
  getProductsRateLimit,
} from '../middlewares/rate.js'

const router = Router()

router.post(
  '/',
  createProductsRateLimit,
  verifyAccessToken,
  createProductValidator,
  validateFields,
  createProductsController
)

router.get(
  '/',
  getProductsRateLimit,
  verifyAccessToken,
  paginationProductValidator,
  validateFields,
  getUserProductsController
)

export default router
