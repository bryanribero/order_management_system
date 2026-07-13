import { Router } from 'express'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createProductsController,
  getUserProductByIdController,
  getUserProductsController,
  updateProductController,
} from '../controllers/products.controller.js'
import {
  createProductValidator,
  paginationProductValidator,
  paramsProductValidator,
  queryUpdateProductValidator,
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

router.get(
  '/:id',
  getProductsRateLimit,
  verifyAccessToken,
  paramsProductValidator,
  validateFields,
  getUserProductByIdController
)

router.patch(
  '/',
  getProductsRateLimit,
  verifyAccessToken,
  queryUpdateProductValidator,
  validateFields,
  updateProductController
)

export default router
