import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import Courier from '../db/models/Courier.js'
import Customer from '../db/models/Customer.js'
import Order from '../db/models/Order.js'
import OrderItem from '../db/models/OrderItem.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const credentials = {
    email: `order-create-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  }

  const user = await registerNewUser(credentials)
  const { accessToken } = await loginUser(credentials)

  return {
    user,
    accessToken,
  }
}

async function createOrderFixture(user) {
  const customer = await Customer.create({
    id_user: user.id_user,
    name: 'Cliente create endpoint',
    address: 'Calle create endpoint 123',
  })

  const courier = await Courier.create({
    id_user: user.id_user,
    name: `Courier create endpoint ${crypto.randomUUID()}`,
  })

  const product = await Product.create({
    id_user: user.id_user,
    sku: `ORD-CREATE-END-${crypto.randomUUID()}`,
    name: 'Producto create endpoint',
    price: '12.50',
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

describe('POST /orders', () => {
  const endpoint = '/api/orders'

  it('deberia crear una order para el usuario autenticado', async () => {
    const { user, accessToken } = await createAuthenticatedUser()
    const { customer, courier, product } = await createOrderFixture(user)

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        action_token: crypto.randomUUID(),
        id_customer: customer.id_customer,
        id_courier: courier.id_courier,
        note: 'Crear desde endpoint',
        items: [
          {
            id_product: product.id_product,
            quantity: 3,
          },
        ],
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Pedido creado correctamente',
        order: expect.objectContaining({
          id_order: expect.any(Number),
          id_customer: customer.id_customer,
          id_courier: courier.id_courier,
          note: 'Crear desde endpoint',
          status: 'pending',
          total_amount: '37.50',
        }),
      })
    )

    expect(response.body.order.request_fingerprint).toBeUndefined()
    expect(response.body.order.orderItems).toHaveLength(1)

    const productDB = await Product.findByPk(product.id_product)
    expect(productDB.stock).toBe(7)
  })

  it('deberia devolver la misma order si se reenvia la misma peticion con el mismo action_token', async () => {
    const { user, accessToken } = await createAuthenticatedUser()
    const { customer, courier, product } = await createOrderFixture(user)

    const requestBody = {
      action_token: crypto.randomUUID(),
      id_customer: customer.id_customer,
      id_courier: courier.id_courier,
      note: 'Endpoint idempotente',
      items: [
        {
          id_product: product.id_product,
          quantity: 2,
        },
      ],
    }

    const firstResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestBody)

    const secondResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestBody)

    expect(firstResponse.status).toBe(201)
    expect(secondResponse.status).toBe(201)
    expect(secondResponse.body.order.id_order).toBe(
      firstResponse.body.order.id_order
    )
    expect(secondResponse.body.order.request_fingerprint).toBeUndefined()

    await expect(Order.count()).resolves.toBe(1)
    await expect(OrderItem.count()).resolves.toBe(1)

    const productDB = await Product.findByPk(product.id_product)
    expect(productDB.stock).toBe(8)
  })

  it('deberia devolver conflict si se reutiliza el action_token con contenido diferente', async () => {
    const { user, accessToken } = await createAuthenticatedUser()
    const { customer, courier, product } = await createOrderFixture(user)
    const action_token = crypto.randomUUID()

    await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        action_token,
        id_customer: customer.id_customer,
        id_courier: courier.id_courier,
        note: 'Endpoint original',
        items: [
          {
            id_product: product.id_product,
            quantity: 1,
          },
        ],
      })

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        action_token,
        id_customer: customer.id_customer,
        id_courier: courier.id_courier,
        note: 'Endpoint cambiado',
        items: [
          {
            id_product: product.id_product,
            quantity: 2,
          },
        ],
      })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message:
            'El action_token ya fue utilizado con un contenido diferente',
        },
      ],
    })

    await expect(Order.count()).resolves.toBe(1)

    const productDB = await Product.findByPk(product.id_product)
    expect(productDB.stock).toBe(9)
  })

  it('deberia devolver error si no se envia access token', async () => {
    const response = await request(app)
      .post(endpoint)
      .send({
        action_token: crypto.randomUUID(),
        id_customer: 1,
        id_courier: 1,
        items: [
          {
            id_product: 1,
            quantity: 1,
          },
        ],
      })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Token requerido',
        },
      ],
    })
  })
})
