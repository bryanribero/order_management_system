import crypto from 'crypto'
import sequelize from '../db/database.js'
import Courier from '../db/models/Courier.js'
import Customer from '../db/models/Customer.js'
import Order from '../db/models/Order.js'
import OrderItem from '../db/models/OrderItem.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { ConflictError } from '../errors/ConflictError.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import { createOrder } from '../services/orders/orders.service.js'

async function createUser() {
  return await registerNewUser({
    email: `order-create-service-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

async function createOrderFixture(user) {
  const customer = await Customer.create({
    id_user: user.id_user,
    name: 'Cliente create service',
    address: 'Calle create service 123',
  })

  const courier = await Courier.create({
    id_user: user.id_user,
    name: `Courier create service ${crypto.randomUUID()}`,
  })

  const product = await Product.create({
    id_user: user.id_user,
    sku: `ORD-CREATE-SVC-${crypto.randomUUID()}`,
    name: 'Producto create service',
    price: '25.00',
    stock: 10,
  })

  return { customer, courier, product }
}

afterEach(async () => {
  await OrderItem.destroy({ where: {}, force: true })
  await Order.destroy({ where: {}, force: true })
  await Product.destroy({ where: {}, force: true })
  await Courier.destroy({ where: {}, force: true })
  await Customer.destroy({ where: {}, force: true })
  await User.destroy({ where: {}, force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Order Service - createOrder', () => {
  it('deberia crear una order y descontar stock', async () => {
    const user = await createUser()
    const { customer, courier, product } = await createOrderFixture(user)

    const order = await createOrder(user.id_user, {
      action_token: crypto.randomUUID(),
      id_customer: customer.id_customer,
      id_courier: courier.id_courier,
      note: 'Crear desde service',
      items: [
        {
          id_product: product.id_product,
          quantity: 2,
        },
      ],
    })

    expect(order).toMatchObject({
      id_order: expect.any(Number),
      id_customer: customer.id_customer,
      id_courier: courier.id_courier,
      note: 'Crear desde service',
      status: 'pending',
      total_amount: '50.00',
    })

    expect(order.request_fingerprint).toBeUndefined()
    expect(order.orderItems).toHaveLength(1)
    expect(order.orderItems[0]).toMatchObject({
      id_product: product.id_product,
      quantity: 2,
      subtotal: '50.00',
    })

    const productDB = await Product.findByPk(product.id_product)
    expect(productDB.stock).toBe(8)
  })

  it('deberia devolver la misma order si se reenvia la misma peticion con el mismo action_token', async () => {
    const user = await createUser()
    const { customer, courier, product } = await createOrderFixture(user)

    const requestBody = {
      action_token: crypto.randomUUID(),
      id_customer: customer.id_customer,
      id_courier: courier.id_courier,
      note: 'Peticion idempotente',
      items: [
        {
          id_product: product.id_product,
          quantity: 2,
        },
      ],
    }

    const createdOrder = await createOrder(user.id_user, requestBody)
    const repeatedOrder = await createOrder(user.id_user, requestBody)

    expect(repeatedOrder.id_order).toBe(createdOrder.id_order)
    expect(repeatedOrder.request_fingerprint).toBeUndefined()
    expect(repeatedOrder.orderItems).toHaveLength(1)

    await expect(Order.count()).resolves.toBe(1)
    await expect(OrderItem.count()).resolves.toBe(1)

    const productDB = await Product.findByPk(product.id_product)
    expect(productDB.stock).toBe(8)
  })

  it('deberia rechazar el mismo action_token con contenido diferente para el mismo usuario', async () => {
    const user = await createUser()
    const { customer, courier, product } = await createOrderFixture(user)
    const action_token = crypto.randomUUID()

    await createOrder(user.id_user, {
      action_token,
      id_customer: customer.id_customer,
      id_courier: courier.id_courier,
      note: 'Peticion original',
      items: [
        {
          id_product: product.id_product,
          quantity: 1,
        },
      ],
    })

    await expect(
      createOrder(user.id_user, {
        action_token,
        id_customer: customer.id_customer,
        id_courier: courier.id_courier,
        note: 'Peticion modificada',
        items: [
          {
            id_product: product.id_product,
            quantity: 2,
          },
        ],
      })
    ).rejects.toThrow(ConflictError)

    await expect(Order.count()).resolves.toBe(1)

    const productDB = await Product.findByPk(product.id_product)
    expect(productDB.stock).toBe(9)
  })
})
