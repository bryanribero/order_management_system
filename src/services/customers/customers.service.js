import Customer from '../../db/models/Customer.js'

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
