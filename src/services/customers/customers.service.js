import Customer from '../../db/models/Customer.js'
import { AuthError } from '../../errors/AuthError.js'
import { NotFoundError } from '../../errors/NotFoundError.js'

export async function createCustomer(
  idUser,
  { name, address, email, phone, note }
) {
  const customer = await Customer.create({
    id_user: idUser,
    name,
    address,
    email,
    phone,
    note,
  })

  return customer
}

export async function getCustomers(idUser, { page, limit }) {
  const safeLimit = limit || 20
  const safePage = page || 1

  const offset = (safePage - 1) * safeLimit

  const customer = await Customer.findAll({
    where: {
      id_user: idUser,
      deleted_at: null,
    },
    attributes: ['id_customer', 'name', 'address', 'email', 'phone', 'note'],
    limit: safeLimit,
    offset,
  })

  return customer
}

export async function getCustomerById(idUser, idCustomer) {
  const customer = await Customer.findOne({
    where: {
      id_user: idUser,
      id_customer: idCustomer,
      deleted_at: null,
    },
    attributes: ['id_customer', 'name', 'address', 'email', 'phone', 'note'],
  })

  if (!customer) {
    throw new NotFoundError('Customer no encontrado')
  }

  return customer
}

export async function updateCustomerById(
  idUser,
  idCustomer,
  { name, address, email, phone, note }
) {
  const [affectedRow, customer] = await Customer.update(
    { name, address, email, phone, note },
    {
      where: {
        id_user: idUser,
        id_customer: idCustomer,
        deleted_at: null,
      },
      returning: true,
    }
  )

  if (affectedRow === 0) {
    throw new NotFoundError('Customer no encontrado')
  }

  const editCustomer = {
    id_customer: customer[0].id_customer,
    name: customer[0].name,
    address: customer[0].address,
    email: customer[0].email,
    phone: customer[0].phone,
    note: customer[0].note,
  }

  return editCustomer
}

export async function deleteAllCustomers(idUser, { confirmDelete }) {
  if (!confirmDelete) {
    throw new AuthError(
      'Acción no autorizada: se requiere confirmación explícita para eliminar todos los clientes'
    )
  }

  const [affectedRows] = await Customer.update(
    { deleted_at: Date.now() },
    {
      where: {
        id_user: idUser,
        deleted_at: null,
      },
    }
  )

  if (affectedRows === 0) {
    throw new NotFoundError('Customer no encontrado')
  }

  return affectedRows
}
