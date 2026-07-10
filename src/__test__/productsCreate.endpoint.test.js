import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const dataUser = {
    email: `product-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  }

  const user = await registerNewUser(dataUser)

  const { accessToken } = await loginUser(dataUser)

  return {
    user,
    accessToken,
  }
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

describe('POST /products', () => {
  const endpoint = '/api/products'

  it('debería crear un producto asociado al usuario autenticado', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const productData = {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Café molido',
      price: '125.50',
      stock: 12,
    }

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(productData)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      success: true,
      message: 'Producto creado correctamente',
      product: {
        id_product: expect.any(Number),
        sku: productData.sku,
        name: productData.name,
        price: expect.any(String),
        stock: productData.stock,
      },
    })

    const productDB = await Product.findByPk(response.body.product.id_product)

    expect(productDB).not.toBeNull()
    expect(productDB.id_user).toBe(user.id_user)
    expect(productDB.sku).toBe(productData.sku)
    expect(productDB.name).toBe(productData.name)
    expect(productDB.price).toBe(productData.price)
    expect(productDB.stock).toBe(productData.stock)
  })

  it('debería crear un producto sin sku porque es opcional', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const productData = {
      name: 'Caja de té',
      price: '80.00',
      stock: 5,
    }

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(productData)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      success: true,
      message: 'Producto creado correctamente',
      product: {
        id_product: expect.any(Number),
        sku: null,
        name: productData.name,
        price: expect.any(String),
        stock: productData.stock,
      },
    })

    const productDB = await Product.findByPk(response.body.product.id_product)

    expect(productDB.id_user).toBe(user.id_user)
    expect(productDB.sku).toBeNull()
  })

  it('debería rechazar un sku duplicado para el mismo usuario', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const productData = {
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Yerba mate',
      price: '210.00',
      stock: 20,
    }

    await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(productData)

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...productData,
        name: 'Yerba mate premium',
      })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'El SKU ya está en uso para este usuario',
        },
      ],
    })
  })

  it('debería permitir el mismo sku para usuarios distintos', async () => {
    const firstAuthUser = await createAuthenticatedUser()
    const secondAuthUser = await createAuthenticatedUser()

    const sku = `SKU-${crypto.randomUUID()}`

    const firstResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${firstAuthUser.accessToken}`)
      .send({
        sku,
        name: 'Harina',
        price: '55.25',
        stock: 8,
      })

    const secondResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${secondAuthUser.accessToken}`)
      .send({
        sku,
        name: 'Harina integral',
        price: '65.25',
        stock: 10,
      })

    expect(firstResponse.status).toBe(201)
    expect(secondResponse.status).toBe(201)

    const productsWithSku = await Product.findAll({
      where: {
        sku,
      },
    })

    expect(productsWithSku).toHaveLength(2)
  })

  it('debería devolver error si no se envía access token', async () => {
    const response = await request(app).post(endpoint).send({
      name: 'Azúcar',
      price: '42.50',
      stock: 4,
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Token requerido',
        },
      ],
    })
  })

  it('debería devolver errores si el body está vacío', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'El nombre del producto es obligatorio',
          }),
          expect.objectContaining({
            field: 'price',
            message: 'El precio del producto es obligatorio',
          }),
          expect.objectContaining({
            field: 'stock',
            message: 'El stock del producto es obligatorio',
          }),
        ]),
      })
    )
  })

  it('debería devolver error si el precio no es decimal o no es mayor a cero', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const invalidDecimalResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Producto con precio inválido',
        price: 'abc',
        stock: 3,
      })

    expect(invalidDecimalResponse.status).toBe(400)
    expect(invalidDecimalResponse.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'price',
            message: 'El precio del producto debe ser decimal',
          }),
        ]),
      })
    )

    const invalidMinResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Producto con precio cero',
        price: '0',
        stock: 3,
      })

    expect(invalidMinResponse.status).toBe(400)
    expect(invalidMinResponse.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'price',
            message: 'El precio del producto debe ser mayor a 0',
          }),
        ]),
      })
    )
  })

  it('debería devolver error si el stock no es entero o es negativo', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const invalidIntegerResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Producto con stock inválido',
        price: '25.00',
        stock: 'abc',
      })

    expect(invalidIntegerResponse.status).toBe(400)
    expect(invalidIntegerResponse.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'stock',
            message: 'El stock del producto debe ser entero',
          }),
        ]),
      })
    )

    const invalidMinResponse = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Producto con stock negativo',
        price: '25.00',
        stock: -1,
      })

    expect(invalidMinResponse.status).toBe(400)
    expect(invalidMinResponse.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'stock',
            message: 'El stock del producto no puede ser negativo',
          }),
        ]),
      })
    )
  })
})
