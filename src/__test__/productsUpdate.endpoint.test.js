import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import Product from '../db/models/Product.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const credentials = {
    email: `product-update-${crypto.randomUUID()}@hotmail.com`,
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

describe('PATCH /products', () => {
  const endpoint = '/api/products'

  it('deberia actualizar un producto del usuario autenticado usando el filtro word', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      id_user: user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Cafe molido',
      price: 125.5,
      stock: 12,
    })

    const setter = {
      name: 'Cafe en grano',
      price: '150.00',
      stock: 8,
    }

    const response = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        word: 'Cafe',
      })
      .send(setter)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Productos actualizado correctamente',
        products: expect.arrayContaining([
          expect.objectContaining({
            id_product: product.id_product,
            id_user: user.id_user,
            sku: product.sku,
            name: setter.name,
            price: setter.price,
            stock: setter.stock,
          }),
        ]),
      })
    )

    const productDB = await Product.findByPk(product.id_product)

    expect(productDB).not.toBeNull()
    expect(productDB.id_user).toBe(user.id_user)
    expect(productDB.name).toBe(setter.name)
    expect(productDB.price).toBe(setter.price)
    expect(productDB.stock).toBe(setter.stock)
  })

  it('deberia devolver not found si el filtro word no encuentra un producto del usuario autenticado', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        word: 'Producto inexistente',
      })
      .send({
        name: 'Nuevo nombre',
        price: '99.99',
        stock: 1,
      })

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

  it('deberia devolver not found si el producto filtrado pertenece a otro usuario', async () => {
    const otherUser = await createAuthenticatedUser()
    const { accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      id_user: otherUser.user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Producto privado',
      price: 200,
      stock: 5,
    })

    const response = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        word: 'Producto privado',
      })
      .send({
        name: 'Producto actualizado',
        price: '250.00',
        stock: 10,
      })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Producto no encontrado',
        },
      ],
    })

    const productDB = await Product.findByPk(product.id_product)

    expect(productDB.name).toBe('Producto privado')
    expect(productDB.price).toBe('200.00')
    expect(productDB.stock).toBe(5)
  })

  it('deberia devolver error si no se envia access token', async () => {
    const response = await request(app)
      .patch(endpoint)
      .query({
        word: 'Cafe',
      })
      .send({
        name: 'Cafe en grano',
        price: '150.00',
        stock: 8,
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
})

describe('PATCH /products/:id', () => {
  const endpoint = '/api/products'

  it('deberia actualizar un producto del usuario autenticado usando su identificador', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      id_user: user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Café molido',
      price: 125.5,
      stock: 12,
    })

    const setter = {
      name: 'Café en grano',
      price: '150.00',
      stock: 8,
    }

    const response = await request(app)
      .patch(`${endpoint}/${product.id_product}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(setter)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Producto actualizado correctamente',
        product: expect.arrayContaining([
          expect.objectContaining({
            id_product: product.id_product,
            id_user: user.id_user,
            sku: product.sku,
            name: setter.name,
            price: setter.price,
            stock: setter.stock,
          }),
        ]),
      })
    )

    const productDB = await Product.findByPk(product.id_product)

    expect(productDB).not.toBeNull()
    expect(productDB.id_user).toBe(user.id_user)
    expect(productDB.name).toBe(setter.name)
    expect(productDB.price).toBe(setter.price)
    expect(productDB.stock).toBe(setter.stock)
  })

  it('deberia devolver not found si el producto no pertenece al usuario autenticado', async () => {
    const otherUser = await createAuthenticatedUser()
    const { accessToken } = await createAuthenticatedUser()

    const product = await Product.create({
      id_user: otherUser.user.id_user,
      sku: `SKU-${crypto.randomUUID()}`,
      name: 'Producto privado',
      price: 200,
      stock: 5,
    })

    const response = await request(app)
      .patch(`${endpoint}/${product.id_product}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Producto actualizado',
        price: '250.00',
        stock: 10,
      })

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

  it('deberia devolver error si el identificador no es un número entero', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .patch(`${endpoint}/abc`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Producto actualizado',
        price: '250.00',
        stock: 10,
      })

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
})
