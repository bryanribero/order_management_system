import Courier from '../../db/models/Courier.js'
import { UniqueConstraintError } from 'sequelize'
import { ConflictError } from '../../errors/ConflictError.js'
import { NotFoundError } from '../../errors/NotFoundError.js'

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
        'El nombre ya está en uso, debe ser único por repartidor'
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
      deleted_at: null,
    },
    limit: safeLimit,
    offset,
    attributes: ['id_courier', 'name', 'phone', 'note'],
  })

  return couriers
}

export async function getCourierById(idUser, idCourier) {
  const courier = await Courier.findOne({
    where: {
      id_user: idUser,
      id_courier: idCourier,
      deleted_at: null,
    },
    attributes: ['id_courier', 'name', 'phone', 'note'],
  })

  if (!courier) {
    throw new NotFoundError('Repartidor no encontrado')
  }

  return courier
}

export async function updateCourierById(
  idUser,
  idCourier,
  { name, phone, note }
) {
  const [affectedRow, updatedCourier] = await Courier.update(
    { name, phone, note },
    {
      where: {
        id_user: idUser,
        id_courier: idCourier,
        deleted_at: null,
      },
      returning: true,
    }
  )

  if (affectedRow === 0) {
    throw new NotFoundError('Repartidor no encontrado')
  }

  return {
    id_courier: updatedCourier[0].id_courier,
    name: updatedCourier[0].name,
    phone: updatedCourier[0].phone,
    note: updatedCourier[0].note,
  }
}

export async function deleteCourierById(idUser, idCourier) {
  const [affectedRow] = await Courier.update(
    { deleted_at: Date.now() },
    {
      where: {
        id_user: idUser,
        id_courier: idCourier,
        deleted_at: null,
      },
    }
  )

  if (affectedRow === 0) {
    throw new NotFoundError('Repartidor no encontrado')
  }
}
