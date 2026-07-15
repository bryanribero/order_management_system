import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import Customer from '../db/models/Customer.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const credentials = {
    email: `customer-${crypto.randomUUID()}@hotmail.com`,
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
  await Customer.destroy({ where: {}, force: true })
  await User.destroy({ where: {}, force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Customer Endpoints', () => {
  const endpoint = '/api/customers'

  describe('POST /customers', () => {
    it('debería crear un customer asociado al usuario autenticado', async () => {
      const { user, accessToken } = await createAuthenticatedUser()

      const customerData = {
        name: 'Juan Pérez',
        address: 'Av. Siempre Viva 742',
        email: 'juan@example.com',
        phone: '1122334455',
        note: 'Cliente nuevo',
      }

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(customerData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Customer creado correctamente',
          customer: expect.objectContaining({
            id_customer: expect.any(Number),
            name: customerData.name,
            address: customerData.address,
            email: customerData.email,
            phone: customerData.phone,
            note: customerData.note,
          }),
        })
      )

      const customerDB = await Customer.findByPk(
        response.body.customer.id_customer
      )
      expect(customerDB).not.toBeNull()
      expect(customerDB.id_user).toBe(user.id_user)
    })

    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app).post(endpoint).send({
        name: 'Cliente sin token',
        address: 'Calle 123',
      })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Token requerido' }],
      })
    })

    it('debería devolver errores de validación si name está vacío', async () => {
      const { accessToken } = await createAuthenticatedUser()

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '', address: 'La casa' })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'El campo name no puede estar vacio',
            }),
          ]),
        })
      )
    })
  })

  describe('GET /customers', () => {
    it('debería obtener customers del usuario autenticado con paginación', async () => {
      const { accessToken, user } = await createAuthenticatedUser()

      await Customer.create({
        id_user: user.id_user,
        name: 'Cliente 1',
        address: 'Calle 1',
      })
      await Customer.create({
        id_user: user.id_user,
        name: 'Cliente 2',
        address: 'Calle 2',
      })

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 20 })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          customers: expect.any(Array),
        })
      )
      expect(response.body.customers).toHaveLength(2)
    })

    it('debería devolver 400 cuando page o limit son inválidos', async () => {
      const { accessToken } = await createAuthenticatedUser()

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 0, limit: -1 })

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
  })

  describe('GET /customers/:id', () => {
    it('debería obtener un customer por su identificador', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const customer = await Customer.create({
        id_user: user.id_user,
        name: 'Cliente prueba',
        address: 'Calle prueba',
      })

      const response = await request(app)
        .get(`${endpoint}/${customer.id_customer}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          customer: expect.objectContaining({
            id_customer: customer.id_customer,
            name: customer.name,
            address: customer.address,
          }),
        })
      )
    })

    it('debería devolver 404 si el customer no pertenece al usuario', async () => {
      const otherUser = await createAuthenticatedUser()
      const { accessToken } = await createAuthenticatedUser()
      const customer = await Customer.create({
        id_user: otherUser.user.id_user,
        name: 'Cliente ajeno',
        address: 'Calle ajena',
      })

      const response = await request(app)
        .get(`${endpoint}/${customer.id_customer}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Customer no encontrado' }],
      })
    })
  })

  describe('PATCH /customers/:id', () => {
    it('debería actualizar un customer existente', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const customer = await Customer.create({
        id_user: user.id_user,
        name: 'Cliente original',
        address: 'Calle original',
      })

      const response = await request(app)
        .patch(`${endpoint}/${customer.id_customer}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Cliente actualizado', note: 'Actualización de prueba' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Customer actualizado correctamente',
          customer: expect.objectContaining({
            id_customer: customer.id_customer,
            name: 'Cliente actualizado',
            note: 'Actualización de prueba',
          }),
        })
      )
    })

    it('debería devolver 404 si el customer no pertenece al usuario', async () => {
      const otherUser = await createAuthenticatedUser()
      const { accessToken } = await createAuthenticatedUser()
      const customer = await Customer.create({
        id_user: otherUser.user.id_user,
        name: 'Cliente externo',
        address: 'Calle externa',
      })

      const response = await request(app)
        .patch(`${endpoint}/${customer.id_customer}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Nombre fallido' })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Customer no encontrado' }],
      })
    })
  })

  describe('DELETE /customers/all', () => {
    it('debería eliminar lógicamente todos los customers del usuario autenticado', async () => {
      const { accessToken, user } = await createAuthenticatedUser()

      await Customer.create({
        id_user: user.id_user,
        name: 'Cliente 1',
        address: 'Calle 1',
      })
      await Customer.create({
        id_user: user.id_user,
        name: 'Cliente 2',
        address: 'Calle 2',
      })

      const response = await request(app)
        .delete(`${endpoint}/all`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ confirmDelete: true })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Customers eliminados correctamente',
          deletedCount: 2,
        })
      )
    })
  })

  describe('DELETE /customers/:id', () => {
    it('debería eliminar lógicamente un customer existente', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const customer = await Customer.create({
        id_user: user.id_user,
        name: 'Cliente eliminar',
        address: 'Calle eliminar',
      })

      const response = await request(app)
        .delete(`${endpoint}/${customer.id_customer}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(204)
      const customerDB = await Customer.findByPk(customer.id_customer)
      expect(customerDB.deleted_at).not.toBeNull()
    })
  })
})
