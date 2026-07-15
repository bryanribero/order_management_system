import {
  createOrder,
  getOrderById,
  getOrders,
  updateStatusOrder,
} from '../services/orders/orders.service.js'

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

export async function getOrderByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idOrder = req.params.id

  try {
    const result = await getOrderById(idUser, idOrder)

    res.status(200).json({
      success: true,
      order: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function statusUpdateOrderController(req, res, next) {
  const idUser = req.user.id_user
  const idOrder = req.params.id
  const status = req.body

  try {
    const result = await updateStatusOrder(idUser, idOrder, status)

    res.status(200).json({
      success: true,
      message: 'Estado de la orden actualizado correctamente',
      order: result,
    })
  } catch (error) {
    next(error)
  }
}
