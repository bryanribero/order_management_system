import { Router } from 'express'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import {
  createProductsController,
  deleteProductsController,
  getUserProductByIdController,
  getUserProductsController,
  updateProductByIdController,
  updateProductController,
} from '../controllers/products.controller.js'
import {
  createProductValidator,
  paginationProductValidator,
  paramsProductValidator,
  queryProductValidator,
} from '../validators/products.validator.js'
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
  paginationProductValidator,
  validateFields,
  getUserProductsController
)

router.get(
  '/:id',
  ProductsRateLimit,
  verifyAccessToken,
  paramsProductValidator,
  validateFields,
  getUserProductByIdController
)

router.patch(
  '/',
  ProductsRateLimit,
  verifyAccessToken,
  queryProductValidator,
  validateFields,
  updateProductController
)

router.patch(
  '/:id',
  ProductsRateLimit,
  verifyAccessToken,
  paramsProductValidator,
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

export default router
