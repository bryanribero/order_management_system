import { createCustomer } from '../services/customers/customers.service.js'

export async function createCustomerController(req, res, next) {
  const idUser = req.user.id_user
  const data = req.body

  try {
    const { id_customer, name, address, email, phone, note } =
      await createCustomer(idUser, data)

    res.status(201).json({
      success: true,
      message: 'Customer creado correctamente',
      customer: {
        id_customer,
        name,
        address,
        email,
        phone,
        note,
      },
    })
  } catch (error) {
    next(error)
  }
}
