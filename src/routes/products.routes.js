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
import { ProductsRateLimit } from '../middlewares/rate.js'

const router = Router()

router.post(
  '/',
  ProductsRateLimit,
  verifyAccessToken,
  createProductValidator,
  validateFields,
  createProductsController
)

router.get(
  '/',
  ProductsRateLimit,
  verifyAccessToken,
  paginationValidator,
  validateFields,
  getUserProductsController
)

router.get(
  '/:id',
  ProductsRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  getUserProductByIdController
)

router.patch(
  '/',
  ProductsRateLimit,
  verifyAccessToken,
  queryProductValidator,
  updateProductValidator,
  validateFields,
  updateProductController
)

router.patch(
  '/:id',
  ProductsRateLimit,
  verifyAccessToken,
  paramsValidator,
  updateProductValidator,
  validateFields,
  updateProductByIdController
)

router.delete(
  '/',
  ProductsRateLimit,
  verifyAccessToken,
  queryProductValidator,
  validateFields,
  deleteProductsController
)

router.delete(
  '/:id',
  ProductsRateLimit,
  verifyAccessToken,
  paramsValidator,
  validateFields,
  deletedProductByIdController
)

export default router
