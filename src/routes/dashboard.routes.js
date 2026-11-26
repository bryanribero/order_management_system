import { Router } from 'express'
import { getStatsController } from '../controllers/dashboard.controller.js'
import { statsLimit } from '../middlewares/rate.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'

const router = Router()

router.get('/', statsLimit, verifyAccessToken, getStatsController)

export default router
