import { Router } from 'express'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createProductsController,
  deletedProductByIdController,
  deleteProductsController,
  getUserProductByIdController,
  getUserProductsController,
  updateProductByIdController,
  updateProductController,
} from '../controllers/products.controller.js'
import {
  createProductValidator,
  queryProductValidator,
  updateProductValidator,
} from '../validators/products.validator.js'
import {
  paginationValidator,
  paramsValidator,
} from '../validators/request.validator.js'
import { validateFields } from '../middlewares/validateFields.js'
import { productsRateLimit } from '../middlewares/rate.js'

const router = Router()

router.post(
  '/',
  productsRateLimit,
  verifyAccessToken,
  createProductValidator,
  validateFields,
  createProductsController
)

router.get(
  '/',
  productsRateLimit,
  verifyAccessToken,
  paginationValidator,
  validateFields,
  getUserProductsController
)

router.get(
  '/:id',
  productsRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  getUserProductByIdController
)

router.patch(
  '/',
  productsRateLimit,
  verifyAccessToken,
  queryProductValidator,
  updateProductValidator,
  validateFields,
  updateProductController
)

router.patch(
  '/:id',
  productsRateLimit,
  verifyAccessToken,
  paramsValidator,
  updateProductValidator,
  validateFields,
  updateProductByIdController
)

router.delete(
  '/',
  productsRateLimit,
  verifyAccessToken,
  queryProductValidator,
  validateFields,
  deleteProductsController
)

router.delete(
  '/:id',
  productsRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  deletedProductByIdController
)

export default router
