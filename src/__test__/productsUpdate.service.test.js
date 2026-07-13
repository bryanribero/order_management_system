import crypto from 'crypto'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import {
  createProduct,
  updateProduct,
} from '../services/products/products.service.js'

async function createUser() {
  return await registerNewUser({
    email: `product-update-service-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

afterEach(async () => {
  await Product.destroy({
    where: {},
    force: true,
  })

  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Product Service - updateProduct', () => {
  it('deberia actualizar un producto del usuario indicado usando el filtro word', async () => {
    const user = await createUser()

    const word = 'Cafe'

    const product = await createProduct(user.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: '125.50',
      stock: 12,
    })

    const updatedProduct = await updateProduct(user.id_user, word, {
      name: 'Cafe en grano',
      price: '150.00',
      stock: 8,
    })

    expect(updatedProduct[0]).toMatchObject({
      id_product: product.id_product,
      id_user: user.id_user,
      sku: product.sku,
      name: 'Cafe en grano',
      price: '150.00',
      stock: 8,
    })

    const productDB = await Product.findByPk(product.id_product)

    expect(productDB).not.toBeNull()
    expect(productDB.name).toBe('Cafe en grano')
    expect(productDB.price).toBe('150.00')
    expect(productDB.stock).toBe(8)
  })

  it('deberia devolver not found si el filtro no encuentra un producto del usuario indicado', async () => {
    const user = await createUser()

    const word = 'Producto inexistente'

    await expect(
      updateProduct(user.id_user, word, {
        name: 'Nuevo nombre',
        price: '99.99',
        stock: 1,
      })
    ).rejects.toMatchObject({
      message: 'Producto no encontrado',
      status: 404,
    })
  })

  it('deberia devolver not found si el producto encontrado pertenece a otro usuario', async () => {
    const user = await createUser()
    const otherUser = await createUser()

    const word = 'Producto privado'

    const otherUserProduct = await createProduct(otherUser.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Producto privado',
      price: '200.00',
      stock: 5,
    })

    await expect(
      updateProduct(user.id_user, word, {
        name: 'Producto actualizado',
        price: '250.00',
        stock: 10,
      })
    ).rejects.toMatchObject({
      message: 'Producto no encontrado',
      status: 404,
    })

    const productDB = await Product.findByPk(otherUserProduct.id_product)

    expect(productDB.name).toBe('Producto privado')
    expect(productDB.price).toBe('200.00')
    expect(productDB.stock).toBe(5)
  })
})
