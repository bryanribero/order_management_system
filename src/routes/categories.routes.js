import { Router } from 'express'
import { getCategoriesController } from '../controllers/categories.controller.js'

const router = Router()

router.get('', getCategoriesController)

export default router
