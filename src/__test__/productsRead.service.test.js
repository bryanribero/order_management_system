import crypto from 'crypto'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import { createProduct, getUserProducts } from '../services/products/products.service.js'

async function createUser() {
  return await registerNewUser({
    email: `product-read-service-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

async function createProductsForUser(idUser, amount) {
  const products = []

  for (let index = 1; index <= amount; index++) {
    const product = await createProduct(idUser, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: `Producto ${index}`,
      price: '100.00',
      stock: index,
    })

    products.push(product)
  }

  return products
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

describe('Product Service - getUserProducts', () => {
  it('deberia obtener solo los productos asociados al usuario indicado respetando pagina y limite', async () => {
    const user = await createUser()
    const otherUser = await createUser()

    const userProducts = await createProductsForUser(user.id_user, 3)

    await createProduct(otherUser.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Producto de otro usuario',
      price: '99.99',
      stock: 3,
    })

    const products = await getUserProducts(user.id_user, {
      page: 2,
      limit: 2,
    })

    expect(products).toHaveLength(1)
    expect(products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id_product: userProducts[2].id_product,
          id_user: user.id_user,
          sku: userProducts[2].sku,
          name: userProducts[2].name,
          price: userProducts[2].price,
          stock: userProducts[2].stock,
        }),
      ])
    )
    expect(products.every((product) => product.id_user === user.id_user)).toBe(true)
  })

  it('deberia devolver un array vacio si el usuario no tiene productos', async () => {
    const user = await createUser()
    const otherUser = await createUser()

    await createProduct(otherUser.id_user, {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Harina',
      price: '55.25',
      stock: 8,
    })

    const products = await getUserProducts(user.id_user, {
      page: 1,
      limit: 10,
    })

    expect(products).toEqual([])
  })

  it('deberia limitar a 50 productos como maximo aunque se solicite un limite mayor', async () => {
    const user = await createUser()
    const otherUser = await createUser()

    await createProductsForUser(user.id_user, 55)
    await createProductsForUser(otherUser.id_user, 5)

    const products = await getUserProducts(user.id_user, {
      page: 1,
      limit: 100,
    })

    expect(products).toHaveLength(50)
    expect(products.every((product) => product.id_user === user.id_user)).toBe(true)
  })
})
