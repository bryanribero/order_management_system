import { Router } from 'express'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { createProductsController } from '../controllers/products.controller.js'
import { createProductValidator } from '../validators/products.validator.js'
import { validateFields } from '../middlewares/validateFields.js'

const router = Router()

router.post(
  '/',
  verifyAccessToken,
  createProductValidator,
  validateFields,
  createProductsController
)

export default router
