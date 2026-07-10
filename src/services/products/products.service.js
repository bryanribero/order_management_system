import Product from '../../db/models/Product.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { UniqueConstraintError } from 'sequelize'

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
