import crypto from 'crypto'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import { createProduct } from '../services/products/products.service.js'

async function createUser() {
  return await registerNewUser({
    email: `product-service-${crypto.randomUUID()}@hotmail.com`,
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

describe('Product Service - createProduct', () => {
  it('debería crear un producto asociado al usuario indicado', async () => {
    const user = await createUser()

    const productData = {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Café molido',
      price: '125.50',
      stock: 12,
    }

    const product = await createProduct(user.id_user, productData)

    expect(product).toMatchObject({
      id_product: expect.any(Number),
      id_user: user.id_user,
      sku: productData.sku,
      name: productData.name,
      price: productData.price,
      stock: productData.stock,
    })

    const productDB = await Product.findByPk(product.id_product)

    expect(productDB).not.toBeNull()
    expect(productDB.id_user).toBe(user.id_user)
    expect(productDB.sku).toBe(productData.sku)
    expect(productDB.name).toBe(productData.name)
    expect(productDB.price).toBe(productData.price)
    expect(productDB.stock).toBe(productData.stock)
  })

  it('debería crear un producto sin sku porque es opcional', async () => {
    const user = await createUser()

    const productData = {
      name: 'Caja de té',
      price: '80.00',
      stock: 5,
    }

    const product = await createProduct(user.id_user, productData)

    expect(product).toMatchObject({
      id_product: expect.any(Number),
      id_user: user.id_user,
      sku: null,
      name: productData.name,
      price: productData.price,
      stock: productData.stock,
    })

    const productDB = await Product.findByPk(product.id_product)

    expect(productDB).not.toBeNull()
    expect(productDB.sku).toBeNull()
  })

  it('debería rechazar un sku duplicado para el mismo usuario', async () => {
    const user = await createUser()

    const productData = {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Yerba mate',
      price: '210.00',
      stock: 20,
    }

    await createProduct(user.id_user, productData)

    await expect(
      createProduct(user.id_user, {
        ...productData,
        name: 'Yerba mate premium',
      })
    ).rejects.toMatchObject({
      message: 'El SKU ya está en uso para este usuario',
      status: 409,
    })

    const productsWithSku = await Product.findAll({
      where: {
        id_user: user.id_user,
        sku: productData.sku,
      },
    })

    expect(productsWithSku).toHaveLength(1)
  })

  it('debería permitir el mismo sku para usuarios distintos', async () => {
    const firstUser = await createUser()
    const secondUser = await createUser()

    const sku = `SKU-${crypto.randomUUID()}`

    const firstProduct = await createProduct(firstUser.id_user, {
      sku,
      name: 'Harina',
      price: '55.25',
      stock: 8,
    })

    const secondProduct = await createProduct(secondUser.id_user, {
      sku,
      name: 'Harina integral',
      price: '65.25',
      stock: 10,
    })

    expect(firstProduct.id_user).toBe(firstUser.id_user)
    expect(secondProduct.id_user).toBe(secondUser.id_user)
    expect(firstProduct.sku).toBe(sku)
    expect(secondProduct.sku).toBe(sku)

    const productsWithSku = await Product.findAll({
      where: {
        sku,
      },
    })

    expect(productsWithSku).toHaveLength(2)
  })
})
