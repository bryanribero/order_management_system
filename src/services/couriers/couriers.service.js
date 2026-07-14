import Courier from '../../db/models/Courier.js'
import { UniqueConstraintError } from 'sequelize'
import { ConflictError } from '../../errors/ConflictError.js'

export async function createCourier(idUser, { name, phone, note }) {
  try {
    const courier = await Courier.create({
      id_user: idUser,
      name,
      phone,
      note,
    })

    return courier
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError(
        'El name ya esta en uso, debe ser unico por courier'
      )
    }

    throw err
  }
}

export async function getCouriers(idUser, { page, limit }) {
  const safePage = page || 1
  const safeLimit = limit || 20

  const offset = (safePage - 1) * safeLimit

  const couriers = await Courier.findAll({
    where: {
      id_user: idUser,
    },
    limit: safeLimit,
    offset,
  })

  return couriers
}
