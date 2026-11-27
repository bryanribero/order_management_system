import Order from '../../db/models/Order.js'
import sequelize from '../../db/database.js'
import Customer from '../../db/models/Customer.js'

export async function getStatsService(idUser) {
  return await sequelize.transaction(async (t) => {
    const totalSales = await Order.sum('total_amount', {
      where: {
        status: 'completed',
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          where: {
            id_user: idUser,
            deleted_at: null,
          },
        },
      ],
      transaction: t,
    })

    const totalOrders = await Order.count({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          where: {
            id_user: idUser,
            deleted_at: null,
          },
        },
      ],
      transaction: t,
    })
    const totalPending = await Order.count({
      where: {
        status: 'pending',
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          where: {
            id_user: idUser,
            deleted_at: null,
          },
        },
      ],
      transaction: t,
    })

    const totalCompleted = await Order.count({
      where: {
        status: 'completed',
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          where: {
            id_user: idUser,
            deleted_at: null,
          },
        },
      ],
      transaction: t,
    })

    const totalCancelled = await Order.count({
      where: {
        status: 'cancelled',
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          where: {
            id_user: idUser,
            deleted_at: null,
          },
        },
      ],
      transaction: t,
    })

    return {
      totalSales: totalSales ?? '0.00',
      totalOrders,
      totalPending,
      totalCompleted,
      totalCancelled,
    }
  })
}
