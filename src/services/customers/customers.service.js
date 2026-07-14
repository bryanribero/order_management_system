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
