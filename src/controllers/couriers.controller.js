import {
  createCourier,
  getCouriers,
} from '../services/couriers/couriers.service.js'

export async function createCourierController(req, res, next) {
  const idUser = req.user.id_user
  const data = req.body
  try {
    const result = await createCourier(idUser, data)

    res.status(201).json({
      success: true,
      message: 'Courier creado correctamente',
      courier: {
        id_courier: result.id_courier,
        name: result.name,
        phone: result.phone,
        note: result.note,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getCouriersController(req, res, next) {
  const idUser = req.user.id_user
  const pagination = req.query

  try {
    const result = await getCouriers(idUser, pagination)

    res.status(200).json({
      success: true,
      couriers: result,
    })
  } catch (err) {
    next(err)
  }
}
