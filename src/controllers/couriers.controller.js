import {
  createCourier,
  deleteCourierById,
  getCourierById,
  getCouriers,
  updateCourierById,
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

export async function getCourierByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idCourier = req.params.id

  try {
    const result = await getCourierById(idUser, idCourier)

    res.status(200).json({
      success: true,
      courier: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateCourierByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idCourier = req.params.id
  const setter = req.body

  try {
    const result = await updateCourierById(idUser, idCourier, setter)

    res.status(200).json({
      success: true,
      message: 'Courier actualizado correctamente',
      courier: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteCourierByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idCourier = req.params.id

  try {
    await deleteCourierById(idUser, idCourier)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
