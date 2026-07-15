import sequelize from '../../db/database.js'
import Order from '../../db/models/Order.js'
import OrderItem from '../../db/models/OrderItem.js'
import Product from '../../db/models/Product.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { createIdemPotent } from './utils/createIdemPotent.js'
import { BadRequestError } from '../../errors/BadRequestError.js'
import Customer from '../../db/models/Customer.js'
import Courier from '../../db/models/Courier.js'

export async function createOrder(
  idUser,
  { actionToken, id_customer, id_courier, note, items }
) {
  const requestFingerprint = JSON.stringify({
    id_customer,
    id_courier,
    note,
    items,
  })

  return createIdemPotent(actionToken, idUser, requestFingerprint, async () => {
    return sequelize.transaction(async (t) => {
      const customer = await Customer.findOne({
        where: {
          id_customer,
          id_user: idUser,
          deleted_at: null,
        },
        transaction: t,
      })

      if (!customer) {
        throw new NotFoundError('Customer no encontrado')
      }

      const courier = await Courier.findOne({
        where: {
          id_courier,
          id_user: idUser,
          deleted_at: null,
        },
        transaction: t,
      })

      if (!courier) {
        throw new NotFoundError('Courier no encontrado')
      }

      const order = await Order.create(
        { id_customer, id_courier, note },
        { transaction: t }
      )

      let totalAmount = 0

      for (const item of items) {
        const { id_product, quantity } = item

        const product = await Product.findOne({
          where: {
            id_product,
            id_user: idUser,
            deleted_at: null,
          },
          transaction: t,
        })

        if (!product) {
          throw new NotFoundError(`Producto ${id_product} no encontrado`)
        }

        if (product.stock < quantity) {
          throw new BadRequestError(
            `No hay suficiente stock para el producto ${id_product} solicitado. Disponibles: ${product.stock}.`
          )
        }

        const subtotal = Number(product.price) * quantity

        totalAmount += subtotal

        product.stock = product.stock - quantity
        await product.save({ transaction: t })

        await OrderItem.create(
          {
            id_order: order.id_order,
            id_product: product.id_product,
            unit_price: Number(product.price),
            quantity,
            subtotal,
          },
          { transaction: t }
        )
      }

      order.total_amount = totalAmount
      await order.save({ transaction: t })

      const orderWithItems = await Order.findByPk(order.id_order, {
        transaction: t,
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
        attributes: [
          'id_order',
          'id_customer',
          'id_courier',
          'note',
          'status',
          'total_amount',
        ],
      })

      return orderWithItems
    })
  })
}

export async function getOrders(idUser, { limit, page, status }) {
  const safeLimit = limit || 20
  const safePage = page || 1

  const offset = (safePage - 1) * safeLimit

  const where = {}

  if (status) {
    where.status = status
  }

  const orders = await Order.findAll({
    where,
    include: [
      {
        model: Customer,
        as: 'customer',
        where: {
          id_user: idUser,
        },
        attributes: [],
      },
      {
        model: OrderItem,
        as: 'orderItems',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    attributes: [
      'id_order',
      'id_customer',
      'id_courier',
      'note',
      'status',
      'total_amount',
    ],
    order: [['id_order', 'DESC']],
    limit: safeLimit,
    offset,
  })

  return orders
}
