import { getStatsService } from '../services/dashboard/dashboard.service.js'

export async function getStatsController(req, res, next) {
  const idUser = req.user.id_user
  try {
    const result = await getStatsService(idUser)

    res.status(200).json({
      success: true,
      stats: result,
    })
  } catch (err) {
    next(err)
  }
}
