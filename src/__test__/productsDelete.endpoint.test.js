import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const credentials = {
    email: `product-delete-${crypto.randomUUID()}@hotmail.com`,
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

describe('DELETE /products', () => {
  const endpoint = '/api/products'

  it('debería eliminar productos del usuario autenticado usando el filtro word', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const product1 = await Product.create({
      id_user: user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: 125.5,
      stock: 12,
    })

    const product2 = await Product.create({
      id_user: user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Te en bolsas',
      price: 80.0,
      stock: 20,
    })

    const response = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        word: 'Cafe',
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Productos eliminados correctamente',
        deletedCount: 1,
      })
    )

    const deletedProduct = await Product.findByPk(product1.id_product)
    const remainingProduct = await Product.findByPk(product2.id_product)

    expect(deletedProduct).toBeNull()
    expect(remainingProduct).not.toBeNull()
  })

  it('debería devolver not found si el filtro word no encuentra un producto del usuario autenticado', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        word: 'Producto inexistente',
      })

    expect(response.status).toBe(404)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Producto no encontrado',
          }),
        ]),
      })
    )
  })

  it('debería devolver error de validación si el filtro word está vacío', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        word: '',
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    )
  })

  it('debería devolver error 401 si no se proporciona token válido', async () => {
    const response = await request(app).delete(endpoint).query({
      word: 'Cafe',
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    )
  })
})

describe('DELETE /products/:id', () => {
  const endpoint = '/api/products'

  it('debería eliminar un producto del usuario autenticado por su identificador', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      id_user: user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: 125.5,
      stock: 12,
    })

    const response = await request(app)
      .delete(`${endpoint}/${product.id_product}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(204)

    const deletedProduct = await Product.findByPk(product.id_product)
    expect(deletedProduct).toBeNull()
  })

  it('debería devolver not found si el producto no existe', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(`${endpoint}/9999`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Producto no encontrado',
          }),
        ]),
      })
    )
  })

  it('debería devolver error de validación si el id no es un número entero', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(`${endpoint}/abc`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    )
  })

  it('debería devolver error de validación si el id es menor a 1', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(`${endpoint}/0`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    )
  })

  it('debería devolver error 401 si no se proporciona token válido', async () => {
    const response = await request(app).delete(`${endpoint}/1`)

    expect(response.status).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    )
  })
})
