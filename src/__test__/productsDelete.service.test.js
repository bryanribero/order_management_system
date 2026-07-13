import crypto from 'crypto'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import {
  createProduct,
  deleteProducts,
  deleteProductsById,
} from '../services/products/products.service.js'
import { NotFoundError } from '../errors/NotFoundError.js'

async function createUser() {
  return await registerNewUser({
    email: `product-delete-service-${crypto.randomUUID()}@hotmail.com`,
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

describe('Product Service - deleteProducts', () => {
  it('debería eliminar productos del usuario indicado usando el filtro word', async () => {
    const user = await createUser()

    const word = 'Cafe'

    const product1 = await createProduct(user.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: '125.50',
      stock: 12,
    })

    const product2 = await createProduct(user.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Te en bolsas',
      price: '80.00',
      stock: 20,
    })

    const deletedCount = await deleteProducts(user.id_user, word)

    expect(deletedCount).toBe(1)

    const deletedProduct = await Product.findByPk(product1.id_product)
    const remainingProduct = await Product.findByPk(product2.id_product)

    expect(deletedProduct).toBeNull()
    expect(remainingProduct).not.toBeNull()
    expect(remainingProduct.id_user).toBe(user.id_user)
  })

  it('debería devolver not found si el filtro word no encuentra un producto del usuario indicado', async () => {
    const user = await createUser()

    const word = 'Producto inexistente'

    await expect(deleteProducts(user.id_user, word)).rejects.toThrow(
      NotFoundError
    )
  })

  it('debería solo eliminar productos del usuario indicado', async () => {
    const user1 = await createUser()
    const user2 = await createUser()

    const word = 'Cafe'

    const product1 = await createProduct(user1.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: '125.50',
      stock: 12,
    })

    const product2 = await createProduct(user2.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe en grano',
      price: '150.00',
      stock: 8,
    })

    const deletedCount = await deleteProducts(user1.id_user, word)

    expect(deletedCount).toBe(1)

    const deletedProduct = await Product.findByPk(product1.id_product)
    const remainingProduct = await Product.findByPk(product2.id_product)

    expect(deletedProduct).toBeNull()
    expect(remainingProduct).not.toBeNull()
    expect(remainingProduct.id_user).toBe(user2.id_user)
  })
})

describe('Product Service - deleteProductsById', () => {
  it('debería eliminar un producto del usuario indicado por su identificador', async () => {
    const user = await createUser()

    const product = await createProduct(user.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: '125.50',
      stock: 12,
    })

    await deleteProductsById(user.id_user, product.id_product)

    const deletedProduct = await Product.findByPk(product.id_product)
    expect(deletedProduct).toBeNull()
  })

  it('debería devolver not found si el producto no existe', async () => {
    const user = await createUser()

    await expect(deleteProductsById(user.id_user, 9999)).rejects.toThrow(
      NotFoundError
    )
  })

  it('debería devolver not found si el producto pertenece a otro usuario', async () => {
    const user1 = await createUser()
    const user2 = await createUser()

    const product = await createProduct(user2.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: '125.50',
      stock: 12,
    })

    await expect(
      deleteProductsById(user1.id_user, product.id_product)
    ).rejects.toThrow(NotFoundError)

    const remainingProduct = await Product.findByPk(product.id_product)
    expect(remainingProduct).not.toBeNull()
  })
})
