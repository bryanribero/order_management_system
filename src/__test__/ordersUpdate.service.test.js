import crypto from 'crypto'
import sequelize from '../db/database.js'
import Courier from '../db/models/Courier.js'
import Customer from '../db/models/Customer.js'
import Order from '../db/models/Order.js'
import OrderItem from '../db/models/OrderItem.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import { updateOrder } from '../services/orders/orders.service.js'
import { ConflictError } from '../errors/ConflictError.js'

async function createUser() {
  return await registerNewUser({
    email: `order-update-service-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

async function createOrderFixture(user) {
  const customer = await Customer.create({
    id_user: user.id_user,
    name: 'Cliente order',
    address: 'Calle order 123',
  })

  const firstCourier = await Courier.create({
    id_user: user.id_user,
    name: `Courier original ${crypto.randomUUID()}`,
  })

  const secondCourier = await Courier.create({
    id_user: user.id_user,
    name: `Courier nuevo ${crypto.randomUUID()}`,
  })

  const firstProduct = await Product.create({
    id_user: user.id_user,
    sku: `ORD-SVC-${crypto.randomUUID()}`,
    name: 'Producto existente',
    price: '10.00',
    stock: 7,
  })

  const secondProduct = await Product.create({
    id_user: user.id_user,
    sku: `ORD-SVC-${crypto.randomUUID()}`,
    name: 'Producto nuevo',
    price: '20.00',
    stock: 5,
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
    unit_price: '10.00',
    quantity: 3,
    subtotal: '30.00',
  })

  return {
    customer,
    firstCourier,
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

describe('Order Service - updateOrder', () => {
  it('deberia actualizar datos, eliminar items, crear items y ajustar stock', async () => {
    const user = await createUser()
    const fixture = await createOrderFixture(user)

    const updatedOrder = await updateOrder(
      user.id_user,
      fixture.order.id_order,
      {
        id_courier: fixture.secondCourier.id_courier,
        note: 'Nota actualizada',
        items: {
          delete: [fixture.orderItem.id_item],
          create: [
            {
              id_product: fixture.secondProduct.id_product,
              quantity: 2,
            },
          ],
        },
      }
    )

    expect(updatedOrder).toMatchObject({
      id_order: fixture.order.id_order,
      id_courier: fixture.secondCourier.id_courier,
      note: 'Nota actualizada',
      status: 'pending',
      total_amount: '40.00',
    })

    expect(updatedOrder.orderItems).toHaveLength(1)
    expect(updatedOrder.orderItems[0]).toMatchObject({
      id_product: fixture.secondProduct.id_product,
      quantity: 2,
      subtotal: '40.00',
    })

    const deletedItem = await OrderItem.findByPk(fixture.orderItem.id_item)
    expect(deletedItem).toBeNull()

    const firstProductDB = await Product.findByPk(
      fixture.firstProduct.id_product
    )
    const secondProductDB = await Product.findByPk(
      fixture.secondProduct.id_product
    )

    expect(firstProductDB.stock).toBe(10)
    expect(secondProductDB.stock).toBe(3)
  })

  it('deberia rechazar cambios si la order no esta pending', async () => {
    const user = await createUser()
    const fixture = await createOrderFixture(user)

    await fixture.order.update({ status: 'completed' })

    await expect(
      updateOrder(user.id_user, fixture.order.id_order, {
        note: 'No deberia cambiar',
      })
    ).rejects.toThrow(ConflictError)

    const orderDB = await Order.findByPk(fixture.order.id_order)
    expect(orderDB.note).toBe('Nota original')
  })
})
