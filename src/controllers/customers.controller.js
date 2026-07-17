import {
  createCustomer,
  deleteAllCustomers,
  deleteCustomerById,
  getCustomerById,
  getCustomers,
  updateCustomerById,
} from '../services/customers/customers.service.js'

export async function createCustomerController(req, res, next) {
  const idUser = req.user.id_user
  const data = req.body

  try {
    const { id_customer, name, address, email, phone, note } =
      await createCustomer(idUser, data)

    res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente',
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

export async function getCustomerByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idCustomer = req.params.id

  try {
    const result = await getCustomerById(idUser, idCustomer)

    res.status(200).json({
      success: true,
      customer: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateCustomerByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idCustomer = req.params.id
  const setter = req.body

  try {
    const result = await updateCustomerById(idUser, idCustomer, setter)

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado correctamente',
      customer: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteAllCustomersController(req, res, next) {
  const idUser = req.user.id_user
  const confirmDelete = req.body

  try {
    const result = await deleteAllCustomers(idUser, confirmDelete)

    res.status(200).json({
      success: true,
      message: 'Clientes eliminados correctamente',
      deletedCount: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteCustomerByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idCustomer = req.params.id

  try {
    await deleteCustomerById(idUser, idCustomer)

    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
