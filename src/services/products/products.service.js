import Product from '../../db/models/Product.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { UniqueConstraintError } from 'sequelize'
import { NotFoundError } from '../../errors/NotFoundError.js'

export async function createProduct(id_user, { sku, name, price, stock }) {
  try {
    const product = await Product.create({
      id_user,
      sku,
      name,
      price,
      stock,
    })

    return product
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError('El SKU ya está en uso para este usuario')
    }

    throw err
  }
}

export async function getUserProducts(idUser, { page, limit }) {
  const safePage = page || 1
  const safeLimit = limit || 20

  const offset = (safePage - 1) * safeLimit

  const products = await Product.findAll({
    where: {
      id_user: idUser,
    },
    limit: safeLimit,
    offset: offset,
  })

  return products
}

export async function getUserProductById(idUser, idProduct) {
  const product = await Product.findOne({
    where: { id_product: idProduct, id_user: idUser },
    attributes: ['id_product', 'id_user', 'sku', 'name', 'price', 'stock'],
  })

  if (!product) {
    throw new NotFoundError('Producto no encontrado')
  }

  return product
}
