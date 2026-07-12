import app from '../../app'
import request from 'supertest'
import { registerNewUser, loginUser } from '../services/auth/auth.service.js'
import Product from '../db/models/Product.js'
import sequelize from '../db/database.js'
import User from '../db/models/User.js'

export async function createAuthenticatedUser() {
  const credentials = {
    email: `user-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  }

  const user = await registerNewUser(credentials)
  const { accessToken } = await loginUser(credentials)

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

describe('GET /products/:id', () => {
  const endpoint = '/api/products'

  it('debería obtener un producto del usuario por su identificador', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      id_user: user.id_user,
      name: 'Producto de prueba',
      price: 100,
      stock: 20,
    })

    const response = await request(app)
      .get(`${endpoint}/${product.id_product}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        product: expect.objectContaining({
          id_product: product.id_product,
          id_user: product.id_user,
          sku: null,
          name: 'Producto de prueba',
          price: '100.00',
          stock: 20,
        }),
      })
    )
  })

  it('debería devolver error si el producto no existe', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      name: 'Producto de prueba',
      price: 100,
      stock: 20,
      id_user: user.id_user,
    })

    await product.destroy()

    const response = await request(app)
      .get(`${endpoint}/${product.id_product}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)

    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Producto no encontrado',
        },
      ],
    })
  })

  it('debería devolver error si el producto pertenece a otro usuario', async () => {
    const { user } = await createAuthenticatedUser()

    const { accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      name: 'Producto privado',
      price: 200,
      stock: 5,
      id_user: user.id_user,
    })

    const response = await request(app)
      .get(`${endpoint}/${product.id_product}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)

    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Producto no encontrado',
        },
      ],
    })
  })

  it('debería devolver error si el identificador no es un número entero', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(`${endpoint}/abc`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'El identificador debe ser un número entero',
          }),
        ]),
      })
    )
  })

  it('debería devolver error si el identificador es menor a 1', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(`${endpoint}/0`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'El identificador debe ser mayor o igual a 1',
          }),
        ]),
      })
    )
  })

  it('debería devolver error si no se envía access token', async () => {
    const response = await request(app).get(`${endpoint}/1`)

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
})
