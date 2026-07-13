import Product from '../../db/models/Product.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { UniqueConstraintError } from 'sequelize'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { Op } from 'sequelize'

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

export async function updateProduct(idUser, filter, setter) {
  const [affectedRows, updatedProducts] = await Product.update(setter, {
    where: {
      id_user: idUser,
      name: {
        [Op.iLike]: `${filter}%`,
      },
    },
    returning: true,
  })

  if (affectedRows === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  return updatedProducts
}

export async function updateProductById(idUser, idProduct, setter) {
  const [affectedRow, updatedProduct] = await Product.update(setter, {
    where: {
      id_user: idUser,
      id_product: idProduct,
    },
    returning: true,
  })

  if (affectedRow === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  return updatedProduct
}

export async function deleteProducts(idUser, filter) {
  const deletedRows = await Product.destroy({
    where: {
      id_user: idUser,
      name: {
        [Op.iLike]: `${filter}%`,
      },
    },
  })

  if (deletedRows === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  return deletedRows
}

export async function deleteProductsById(idUser, idProduct) {
  const deletedRow = await Product.destroy({
    where: {
      id_user: idUser,
      id_product: idProduct,
    },
  })

  if (deletedRow === 0) {
    throw new NotFoundError('Producto no encontrado')
  }
}
