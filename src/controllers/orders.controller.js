import { createOrder, getOrders } from '../services/orders/orders.service.js'

export async function createOrderController(req, res, next) {
  const idUser = req.user.id_user
  const data = req.body

  try {
    const result = await createOrder(idUser, data)

    res.status(201).json({
      success: true,
      message: 'Orden creada correctamente',
      order: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function getOrdersController(req, res, next) {
  const idUser = req.user.id_user
  const data = req.query

  try {
    const result = await getOrders(idUser, data)

    res.status(200).json({
      success: true,
      orders: result,
    })
  } catch (error) {
    next(error)
  }
}
