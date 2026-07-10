import request from 'supertest'
import app from '../../app.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'
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

describe('GET /products', () => {
  const endpoint = '/api/products'

  it('debería obtener los productos del usuario con paginación', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        page: 1,
        limit: 20,
      })

    expect(response.status).toBe(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        products: expect.any(Array),
      })
    )
  })

  it('debería devolver error si page es menor a 1', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        page: 0,
        limit: 20,
      })

    expect(response.status).toBe(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'page',
            message: 'La página debe ser mayor o igual a 1',
          }),
        ]),
      })
    )
  })

  it('debería devolver error si limit es menor a 1', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        page: 1,
        limit: 0,
      })

    expect(response.status).toBe(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'limit',
            message: 'El límite debe estar entre 1 y 50',
          }),
        ]),
      })
    )
  })

  it('debería devolver errores si page y limit son menores a 1', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        page: -1,
        limit: -5,
      })

    expect(response.status).toBe(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'page',
            message: 'La página debe ser mayor o igual a 1',
          }),
          expect.objectContaining({
            field: 'limit',
            message: 'El límite debe estar entre 1 y 50',
          }),
        ]),
      })
    )
  })

  it('debería devolver error si no se envía access token', async () => {
    const response = await request(app).get(endpoint).query({
      page: 1,
      limit: 20,
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

  it('debería devolver errores si los parámetros page y limit no son enteros', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        page: 'abs',
        limit: '1.2',
      })

    expect(response.status).toBe(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'page',
            message: 'La página debe ser un número entero',
          }),
          expect.objectContaining({
            field: 'limit',
            message: 'El límite debe ser un número entero',
          }),
        ]),
      })
    )
  })
})
