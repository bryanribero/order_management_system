import { Router } from 'express'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { userRateLimit } from '../middlewares/rate.js'
import {
  passwordValidate,
  updateUserValidator,
} from '../validators/credentialsAuth.js'
import { validateFields } from '../middlewares/validateFields.js'
import {
  deleteUserController,
  updateUserController,
} from '../controllers/users.controller.js'

const router = Router()

router.patch(
  '/',
  userRateLimit,
  verifyAccessToken,
  updateUserValidator,
  validateFields,
  updateUserController
)

router.delete(
  '/delete',
  userRateLimit,
  verifyAccessToken,
  passwordValidate,
  validateFields,
  deleteUserController
)

export default router
