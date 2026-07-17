import sequelize from '../../db/database.js'
import Order from '../../db/models/Order.js'
import OrderItem from '../../db/models/OrderItem.js'
import Product from '../../db/models/Product.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { createIdemPotent, fingerprintHash } from './utils/createIdemPotent.js'
import { BadRequestError } from '../../errors/BadRequestError.js'
import Customer from '../../db/models/Customer.js'
import Courier from '../../db/models/Courier.js'
import { ConflictError } from '../../errors/ConflictError.js'

export async function createOrder(
  idUser,
  { action_token, id_customer, id_courier, note, items }
) {
  const fingerprintPayload = {
    id_customer,
    id_courier,
    note: note ?? null,
    items: items
      .map(({ id_product, quantity }) => ({
        id_product: Number(id_product),
        quantity: Number(quantity),
      }))
      .sort((a, b) => a.id_product - b.id_product),
  }

  const requestFingerprint = fingerprintHash(JSON.stringify(fingerprintPayload))

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
      throw new NotFoundError('Cliente no encontrado')
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
      throw new NotFoundError('Repartidor no encontrado')
    }

    return createIdemPotent(
      action_token,
      idUser,
      requestFingerprint,
      t,
      async () => {
        const order = await Order.create(
          {
            id_customer,
            id_courier,
            note,
            action_token,
            request_fingerprint: requestFingerprint,
          },
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
                exclude: ['createdAt', 'updatedAt', 'id_order'],
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
            'action_token',
          ],
        })

        return orderWithItems
      }
    )
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
          exclude: ['createdAt', 'updatedAt', 'id_order'],
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
      'action_token',
    ],
    order: [['id_order', 'DESC']],
    limit: safeLimit,
    offset,
  })

  return orders
}

export async function getOrderById(idUser, idOrder) {
  const order = await Order.findOne({
    where: {
      id_order: idOrder,
    },
    include: [
      {
        model: Customer,
        as: 'customer',
        where: { id_user: idUser },
        attributes: [],
      },
      {
        model: OrderItem,
        as: 'orderItems',
        attributes: { exclude: ['createdAt', 'updatedAt', 'id_order'] },
      },
    ],
    attributes: [
      'id_order',
      'id_customer',
      'id_courier',
      'note',
      'status',
      'total_amount',
      'action_token',
    ],
  })

  if (!order) {
    throw new NotFoundError('Pedido no encontrado')
  }

  return order
}

export async function updateStatusOrder(idUser, idOrder, { status }) {
  const order = await Order.findOne({
    where: {
      id_order: idOrder,
    },
    include: [
      {
        model: Customer,
        as: 'customer',
        where: { id_user: idUser },
        attributes: [],
      },
      {
        model: OrderItem,
        as: 'orderItems',
        attributes: { exclude: ['createdAt', 'updatedAt', 'id_order'] },
      },
    ],
    attributes: [
      'id_order',
      'id_customer',
      'id_courier',
      'note',
      'status',
      'total_amount',
      'action_token',
    ],
  })

  if (!order) {
    throw new NotFoundError('Pedido no encontrado')
  }

  if (order.status !== 'pending') {
    throw new ConflictError(
      'Solo los pedidos con estado "pending" pueden actualizarse'
    )
  }

  order.status = status
  await order.save()

  return order
}

export async function updateOrder(
  idUser,
  idOrder,
  { id_courier, note, items = {} }
) {
  const itemsToCreate = items.create || []
  const itemsToDelete = items.delete || []

  return sequelize.transaction(async (t) => {
    const order = await Order.findOne({
      where: {
        id_order: idOrder,
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          where: { id_user: idUser },
          attributes: [],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    if (!order) {
      throw new NotFoundError('Pedido no encontrado')
    }

    if (order.status !== 'pending') {
      throw new ConflictError(
        'Solo los pedidos con estado "pending" pueden actualizarse'
      )
    }

    if (id_courier !== undefined && id_courier !== null) {
      const courier = await Courier.findOne({
        where: {
          id_courier,
          id_user: idUser,
          deleted_at: null,
        },
        transaction: t,
      })

      if (!courier) {
        throw new NotFoundError('Repartidor no encontrado')
      }
    }

    if (id_courier !== undefined) {
      order.id_courier = id_courier
    }

    if (note !== undefined) {
      order.note = note
    }

    let totalAmount = Number(order.total_amount)

    for (const idItem of itemsToDelete) {
      const orderItem = await OrderItem.findOne({
        where: {
          id_item: idItem,
          id_order: idOrder,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (!orderItem) {
        throw new NotFoundError(`Order item ${idItem} no encontrado`)
      }

      const product = await Product.findOne({
        where: {
          id_product: orderItem.id_product,
          id_user: idUser,
          deleted_at: null,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (!product) {
        throw new NotFoundError(
          `Producto ${orderItem.id_product} no encontrado`
        )
      }

      product.stock = product.stock + orderItem.quantity
      await product.save({ transaction: t })

      totalAmount -= Number(orderItem.subtotal)
      await orderItem.destroy({ transaction: t })
    }

    for (const item of itemsToCreate) {
      const { id_product, quantity } = item

      const existingOrderItem = await OrderItem.findOne({
        where: {
          id_order: idOrder,
          id_product,
        },
        transaction: t,
      })

      const product = await Product.findOne({
        where: {
          id_product,
          id_user: idUser,
          deleted_at: null,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
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

      product.stock -= quantity
      await product.save({ transaction: t })

      if (existingOrderItem) {
        existingOrderItem.quantity += quantity

        existingOrderItem.subtotal =
          Number(existingOrderItem.unit_price) * existingOrderItem.quantity

        await existingOrderItem.save({ transaction: t })
      } else {
        await OrderItem.create(
          {
            id_order: idOrder,
            id_product: product.id_product,
            unit_price: Number(product.price),
            quantity,
            subtotal,
          },
          { transaction: t }
        )
      }

      totalAmount += subtotal
    }

    order.total_amount = totalAmount

    await order.save({ transaction: t })

    await order.reload({
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'id_order'],
          },
        },
      ],
      transaction: t,
    })

    const fingerprintPayload = {
      id_customer: order.id_customer,
      id_courier: order.id_courier,
      note: order.note ?? null,
      items: order.orderItems
        .map(({ id_product, quantity }) => ({
          id_product: Number(id_product),
          quantity: Number(quantity),
        }))
        .sort((a, b) => a.id_product - b.id_product),
    }

    await order.update(
      {
        request_fingerprint: fingerprintHash(
          JSON.stringify(fingerprintPayload)
        ),
      },
      {
        transaction: t,
      }
    )

    return Order.findOne({
      where: { id_order: idOrder },
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
            exclude: ['createdAt', 'updatedAt', 'id_order'],
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
        'action_token',
      ],
      transaction: t,
    })
  })
}
