import Order from '../db/models/Order.js'
import Customer from '../db/models/Customer.js'
import Courier from '../db/models/Courier.js'

async function createOrder() {
  const order = await Order.create({
    id_customer: 2,
  })

  console.log(order.toJSON())
}

async function updateOrder() {
  const order = await Order.update(
    {
      id_courier: 3,
    },
    {
      where: {
        id_order: 1,
      },
      returning: true,
    }
  )

  order[1].map((i) => console.log(i.toJSON()))
}
//updateOrder()
//createOrder()

async function findOrderWithJoin() {
  const order = await Order.findOne({
    include: [
      {
        model: Customer,
        as: 'customer',
      },
      {
        model: Courier,
        as: 'courier',
      },
    ],
  })

  console.log(order.toJSON())
}

findOrderWithJoin()
