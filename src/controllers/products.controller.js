import { createProduct } from '../services/products/products.service.js'

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
        price: String(result.price),
        stock: result.stock,
      },
    })
  } catch (err) {
    next(err)
  }
}
