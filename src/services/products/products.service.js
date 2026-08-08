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
  if (id_category) {
    const category = await Category.findByPk(id_category)

    if (!category) {
      throw new NotFoundError('La categoria no existe')
    }
  }

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
  { sku, name, price, stock, id_category }
) {
  if (id_category) {
    const category = await Category.findByPk(id_category)

    if (!category) {
      throw new NotFoundError('La categoria no existe')
    }
  }

  const data = {}

  if (sku !== undefined) data.sku = sku
  if (name !== undefined) data.name = name
  if (price !== undefined) data.price = price
  if (stock !== undefined) data.stock = stock
  if (id_category !== undefined) data.id_category = id_category

  const [affectedRows, updatedProducts] = await Product.update(data, {
    where: {
      id_user: idUser,
      deleted_at: null,
      name: {
        [Op.iLike]: `${filter}%`,
      },
    },
    returning: true,
  })

  if (affectedRows === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  const productIds = updatedProducts.map((product) => product.id_product)

  const products = await Product.findAll({
    where: {
      id_product: {
        [Op.in]: productIds,
      },
      id_user: idUser,
      deleted_at: null,
    },
    attributes: ['id_product', 'sku', 'name', 'price', 'stock'],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
  })

  return products
}

export async function updateProductById(
  idUser,
  idProduct,
  { sku, name, price, stock, id_category }
) {
  const category = await Category.findByPk(id_category)

  if (!category) {
    throw new NotFoundError('La categoria no existe')
  }

  const data = {}

  if (sku !== undefined) data.sku = sku
  if (name !== undefined) data.name = name
  if (price !== undefined) data.price = price
  if (stock !== undefined) data.stock = stock
  if (id_category !== undefined) data.id_category = id_category

  const [affectedRow] = await Product.update(data, {
    where: {
      id_user: idUser,
      id_product: idProduct,
      deleted_at: null,
    },
    returning: true,
  })

  if (affectedRow === 0) {
    throw new NotFoundError('Producto no encontrado')
  }

  const product = await Product.findByPk(idProduct, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
  })

  return product
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
