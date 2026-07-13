import {
  createProduct,
  getUserProductById,
  getUserProducts,
  updateProduct,
  updateProductById,
  deleteProducts,
  deleteProductsById,
} from '../services/products/products.service.js'

export async function createProductsController(req, res, next) {
  const idUser = req.user.id_user

  try {
    const result = await createProduct(idUser, req.body)

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      product: {
        id_product: result.id_product,
        sku: result.sku,
        name: result.name,
        price: result.price,
        stock: result.stock,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getUserProductsController(req, res, next) {
  const idUser = req.user.id_user

  const pagination = req.query
  try {
    const result = await getUserProducts(idUser, pagination)

    res.status(200).json({
      success: true,
      products: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function getUserProductByIdController(req, res, next) {
  const idUser = req.user.id_user

  const idProduct = req.params.id

  try {
    const result = await getUserProductById(idUser, idProduct)

    res.status(200).json({
      success: true,
      product: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateProductController(req, res, next) {
  const filter = req.query.word
  const idUser = req.user.id_user
  const setter = req.body

  try {
    const result = await updateProduct(idUser, filter, setter)

    res.status(200).json({
      success: true,
      message: 'Productos actualizado correctamente',
      products: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateProductByIdController(req, res, next) {
  const idProduct = req.params.id
  const idUser = req.user.id_user
  const setter = req.body

  try {
    const result = await updateProductById(idUser, idProduct, setter)

    res.status(200).json({
      success: true,
      message: 'Producto actualizado correctamente',
      product: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteProductsController(req, res, next) {
  const filter = req.query.word
  const idUser = req.user.id_user

  try {
    const result = await deleteProducts(idUser, filter)

    res.status(200).json({
      success: true,
      message: 'Productos eliminados correctamente',
      deletedCount: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function deletedProductByIdController(req, res, next) {
  const idUser = req.user.id_user
  const idProduct = req.params.id

  try {
    await deleteProductsById(idUser, idProduct)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
