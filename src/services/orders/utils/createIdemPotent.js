import { ConflictError } from '../../../errors/ConflictError.js'
import crypto from 'crypto'
import Order from '../../../db/models/Order.js'
import OrderItem from '../../../db/models/OrderItem.js'
import Customer from '../../../db/models/Customer.js'

async function findExistingOrder(where, idUser, transaction) {
  return Order.findOne({
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
      'request_fingerprint',
    ],
    transaction,
  })
}

function ensureSameRequest(existingOrder, requestFingerprint) {
  if (existingOrder.request_fingerprint !== requestFingerprint) {
    throw new ConflictError(
      'El action_token ya fue utilizado con un contenido diferente'
    )
  }
}

function hideInternalOrderFields(order) {
  if (order?.dataValues) {
    delete order.dataValues.request_fingerprint
  }

  return order
}

export async function createIdemPotent(
  action_token,
  idUser,
  requestFingerprint,
  transaction,
  action
) {
  if (!action_token) {
    throw new Error('El token de accion es obligatorio')
  }

  const existingOrderWithSameToken = await findExistingOrder(
    {
      action_token,
    },
    idUser,
    transaction
  )

  if (existingOrderWithSameToken) {
    ensureSameRequest(existingOrderWithSameToken, requestFingerprint)

    return hideInternalOrderFields(existingOrderWithSameToken)
  }

  return await action()
}

export function fingerprintHash(fingerprint) {
  if (typeof fingerprint !== 'string') {
    throw new Error('fingerprint tiene que ser un texto')
  }

  return crypto.createHash('sha256').update(fingerprint).digest('hex')
}
