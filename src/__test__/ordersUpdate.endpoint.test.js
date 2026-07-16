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
    email: `order-update-${crypto.randomUUID()}@hotmail.com`,
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
    name: 'Cliente endpoint',
    address: 'Calle endpoint 123',
  })

  const firstCourier = await Courier.create({
    id_user: user.id_user,
    name: `Courier endpoint original ${crypto.randomUUID()}`,
  })

  const secondCourier = await Courier.create({
    id_user: user.id_user,
    name: `Courier endpoint nuevo ${crypto.randomUUID()}`,
  })

  const firstProduct = await Product.create({
    id_user: user.id_user,
    sku: `ORD-END-${crypto.randomUUID()}`,
    name: 'Producto endpoint existente',
    price: '15.00',
    stock: 4,
  })

  const secondProduct = await Product.create({
    id_user: user.id_user,
    sku: `ORD-END-${crypto.randomUUID()}`,
    name: 'Producto endpoint nuevo',
    price: '12.50',
    stock: 6,
  })

  const order = await Order.create({
    id_customer: customer.id_customer,
    id_courier: firstCourier.id_courier,
    note: 'Nota original',
    total_amount: '30.00',
  })

  const orderItem = await OrderItem.create({
    id_order: order.id_order,
    id_product: firstProduct.id_product,
    unit_price: '15.00',
    quantity: 2,
    subtotal: '30.00',
  })

  return {
    secondCourier,
    firstProduct,
    secondProduct,
    order,
    orderItem,
  }
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

describe('PATCH /orders/:id', () => {
  const endpoint = '/api/orders'

  it('deberia actualizar una order pending del usuario autenticado', async () => {
    const { user, accessToken } = await createAuthenticatedUser()
    const fixture = await createOrderFixture(user)

    const response = await request(app)
      .patch(`${endpoint}/${fixture.order.id_order}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        id_courier: fixture.secondCourier.id_courier,
        note: 'Nota endpoint actualizada',
        items: {
          delete: [fixture.orderItem.id_item],
          create: [
            {
              id_product: fixture.secondProduct.id_product,
              quantity: 3,
            },
          ],
        },
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Order actualizado correctamente',
        order: expect.objectContaining({
          id_order: fixture.order.id_order,
          id_courier: fixture.secondCourier.id_courier,
          note: 'Nota endpoint actualizada',
          total_amount: '37.50',
        }),
      })
    )

    expect(response.body.order.orderItems).toHaveLength(1)
    expect(response.body.order.orderItems[0]).toEqual(
      expect.objectContaining({
        id_product: fixture.secondProduct.id_product,
        quantity: 3,
        subtotal: '37.50',
      })
    )

    const firstProductDB = await Product.findByPk(
      fixture.firstProduct.id_product
    )
    const secondProductDB = await Product.findByPk(
      fixture.secondProduct.id_product
    )

    expect(firstProductDB.stock).toBe(6)
    expect(secondProductDB.stock).toBe(3)
  })

  it('deberia devolver conflict si la order no esta pending', async () => {
    const { user, accessToken } = await createAuthenticatedUser()
    const fixture = await createOrderFixture(user)

    await fixture.order.update({ status: 'completed' })

    const response = await request(app)
      .patch(`${endpoint}/${fixture.order.id_order}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        note: 'No deberia cambiar',
      })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Solo las orders con estado "pending" pueden actualizarse',
        },
      ],
    })
  })

  it('deberia devolver error de validacion si el body de items es invalido', async () => {
    const { user, accessToken } = await createAuthenticatedUser()
    const fixture = await createOrderFixture(user)

    const response = await request(app)
      .patch(`${endpoint}/${fixture.order.id_order}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        items: {
          delete: [0],
          create: [
            {
              id_product: 'abc',
              quantity: 2.2,
            },
          ],
        },
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'items.delete[0]',
            message: 'Cada elemento de delete debe ser un entero positivo',
          }),
          expect.objectContaining({
            field: 'items.create[0].id_product',
            message: 'El id del producto debe ser un entero positivo',
          }),
          expect.objectContaining({
            field: 'items.create[0].quantity',
            message: 'La cantidad debe ser un entero positivo',
          }),
        ]),
      })
    )
  })

  it('deberia devolver error si no se envia access token', async () => {
    const response = await request(app).patch(`${endpoint}/1`).send({
      note: 'Nota sin token',
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
