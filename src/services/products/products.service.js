import Product from '../../db/models/Product.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { UniqueConstraintError } from 'sequelize'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { Op } from 'sequelize'
import Category from '../../db/models/Category.js'

export async function createProduct(
  id_user,
  { sku, name, price, stock, id_category }
) {
  const category = await Category.findByPk(id_category)

  if (!category) {
    throw new NotFoundError('La categoria no existe')
  }

  try {
    const product = await Product.create({
      id_user,
      sku,
      name,
      price,
      stock,
      id_category,
    })

    const productWithCategory = await Product.findByPk(product.id_product, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    })

    return productWithCategory
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError('El SKU ya está en uso para este usuario')
    }

    throw err
  }
}

export async function getUserProducts(
  idUser,
  { page, limit, name, id_category }
) {
  const safePage = page || 1
  const safeLimit = limit || 20

  const offset = (safePage - 1) * safeLimit

  const where = { id_user: idUser, deleted_at: null }

  if (name) {
    where.name = {
      [Op.iLike]: `${name}%`,
    }
  }

  if (id_category) {
    where.id_category = id_category
  }

  const products = await Product.findAll({
    where,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
    attributes: ['id_product', 'sku', 'name', 'price', 'stock'],
    limit: safeLimit,
    offset: offset,
  })

  return products
}

export async function getUserProductById(idUser, idProduct) {
  const product = await Product.findOne({
    where: { id_product: idProduct, id_user: idUser, deleted_at: null },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
    attributes: ['id_product', 'sku', 'name', 'price', 'stock'],
  })

  if (!product) {
    throw new NotFoundError('Producto no encontrado')
  }

  return product
}

export async function updateProduct(
  idUser,
  filter,
  { sku, name, price, stock }
) {
  const [affectedRows, updatedProducts] = await Product.update(
    { sku, name, price, stock },
    {
      where: {
        id_user: idUser,
        deleted_at: null,
        name: {
          [Op.iLike]: `${filter}%`,
        },
      },
      returning: true,
    }
  )

  if (affectedRows === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  const response = updatedProducts.map((product) => ({
    id_product: product.id_product,
    sku: product.sku,
    name: product.name,
    price: product.price,
    stock: product.stock,
  }))

  return response
}

export async function updateProductById(
  idUser,
  idProduct,
  { sku, name, price, stock }
) {
  const [affectedRow, updatedProduct] = await Product.update(
    { sku, name, price, stock },
    {
      where: {
        id_user: idUser,
        id_product: idProduct,
        deleted_at: null,
      },
      returning: true,
    }
  )

  if (affectedRow === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  return {
    id_product: updatedProduct[0].id_product,
    sku: updatedProduct[0].sku,
    name: updatedProduct[0].name,
    price: updatedProduct[0].price,
    stock: updatedProduct[0].stock,
  }
}

export async function deleteProducts(idUser, filter) {
  const [affectedRows] = await Product.update(
    { deleted_at: Date.now() },
    {
      where: {
        id_user: idUser,
        deleted_at: null,
        name: {
          [Op.iLike]: `${filter}%`,
        },
      },
    }
  )

  if (affectedRows === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  return affectedRows
}

export async function deleteProductsById(idUser, idProduct) {
  const [affectedRow] = await Product.update(
    { deleted_at: Date.now() },
    {
      where: {
        id_user: idUser,
        id_product: idProduct,
        deleted_at: null,
      },
    }
  )

  if (affectedRow === 0) {
    throw new NotFoundError('Producto no encontrado')
  }
}
