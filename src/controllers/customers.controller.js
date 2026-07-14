import {
  createCustomer,
  getCustomers,
} from '../services/customers/customers.service.js'

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

export async function getCustomersController(req, res, next) {
  const idUser = req.user.id_user
  const pagination = req.query

  try {
    const result = await getCustomers(idUser, pagination)

    res.status(200).json({
      success: true,
      customers: result,
    })
  } catch (error) {
    next(error)
  }
}
