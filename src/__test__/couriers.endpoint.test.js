import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import Courier from '../db/models/Courier.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const credentials = {
    email: `courier-${crypto.randomUUID()}@hotmail.com`,
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
  await Courier.destroy({ where: {}, force: true })
  await User.destroy({ where: {}, force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Courier Endpoints', () => {
  const endpoint = '/api/couriers'

  describe('POST /couriers', () => {
    it('debería crear un courier asociado al usuario autenticado', async () => {
      const { user, accessToken } = await createAuthenticatedUser()

      const courierData = {
        name: 'Repartidor 1',
        phone: '1234567890',
        note: 'Disponible en horario comercial',
      }

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(courierData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Repartidor creado correctamente',
          courier: expect.objectContaining({
            id_courier: expect.any(Number),
            name: courierData.name,
            phone: courierData.phone,
            note: courierData.note,
          }),
        })
      )

      const courierDB = await Courier.findByPk(response.body.courier.id_courier)
      expect(courierDB).not.toBeNull()
      expect(courierDB.id_user).toBe(user.id_user)
      expect(courierDB.name).toBe(courierData.name)
      expect(courierDB.phone).toBe(courierData.phone)
      expect(courierDB.note).toBe(courierData.note)
    })

    it('debería crear un courier sin campos opcionales', async () => {
      const { user, accessToken } = await createAuthenticatedUser()

      const courierData = {
        name: 'Repartidor sin móvil',
      }

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(courierData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Repartidor creado correctamente',
          courier: expect.objectContaining({
            id_courier: expect.any(Number),
            name: courierData.name,
            phone: null,
            note: null,
          }),
        })
      )
    })

    it('debería rechazar un nombre duplicado para el mismo usuario', async () => {
      const { accessToken } = await createAuthenticatedUser()
      const name = `Repartidor ${crypto.randomUUID()}`

      await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name, phone: '1234567890' })

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name, phone: '0987654321' })

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        success: false,
        errors: [
          {
            message: 'El nombre ya está en uso, debe ser único por repartidor',
          },
        ],
      })
    })

    it('debería permitir el mismo nombre para diferentes usuarios', async () => {
      const firstAuthUser = await createAuthenticatedUser()
      const secondAuthUser = await createAuthenticatedUser()
      const name = `Repartidor ${crypto.randomUUID()}`

      const firstResponse = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${firstAuthUser.accessToken}`)
        .send({ name, phone: '1234567890' })

      const secondResponse = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${secondAuthUser.accessToken}`)
        .send({ name, phone: '0987654321' })

      expect(firstResponse.status).toBe(201)
      expect(secondResponse.status).toBe(201)
    })

    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app)
        .post(endpoint)
        .send({ name: 'Repartidor 1' })

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
        .send({ name: '' })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'El nombre no puede estar vacío',
            }),
          ]),
        })
      )
    })
  })

  describe('GET /couriers', () => {
    it('debería obtener couriers del usuario autenticado con paginación', async () => {
      const { accessToken, user } = await createAuthenticatedUser()

      await Courier.create({
        id_user: user.id_user,
        name: 'Repartidor 1',
        phone: '1234567890',
      })
      await Courier.create({
        id_user: user.id_user,
        name: 'Repartidor 2',
        phone: '0987654321',
      })

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 20 })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          couriers: expect.any(Array),
        })
      )
      expect(response.body.couriers).toHaveLength(2)
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

    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app).get(endpoint)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Token requerido' }],
      })
    })
  })

  describe('GET /couriers/:id', () => {
    it('debería obtener un courier por su identificador', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: user.id_user,
        name: 'Repartidor prueba',
        phone: '1234567890',
      })

      const response = await request(app)
        .get(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          courier: expect.objectContaining({
            id_courier: courier.id_courier,
            name: courier.name,
            phone: courier.phone,
            note: courier.note,
          }),
        })
      )
    })

    it('debería devolver 404 si no existe el courier o pertenece a otro usuario', async () => {
      const otherAuthUser = await createAuthenticatedUser()
      const { accessToken } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: otherAuthUser.user.id_user,
        name: 'Repartidor ajeno',
      })

      const response = await request(app)
        .get(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Repartidor no encontrado' }],
      })
    })

    it('debería devolver 400 si el id no es un número entero', async () => {
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

    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app).get(`${endpoint}/1`)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Token requerido' }],
      })
    })
  })

  describe('PATCH /couriers/:id', () => {
    it('debería actualizar un courier existente', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: user.id_user,
        name: 'Repartidor original',
        phone: '1234567890',
      })

      const response = await request(app)
        .patch(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Repartidor actualizado', note: 'Atrás muy rápido' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Repartidor actualizado correctamente',
          courier: expect.objectContaining({
            id_courier: courier.id_courier,
            name: 'Repartidor actualizado',
            phone: courier.phone,
            note: 'Atrás muy rápido',
          }),
        })
      )
    })

    it('debería devolver 404 si el courier no pertenece al usuario', async () => {
      const otherUser = await createAuthenticatedUser()
      const { accessToken } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: otherUser.user.id_user,
        name: 'Repartidor externo',
      })

      const response = await request(app)
        .patch(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Nombre fallido' })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Repartidor no encontrado' }],
      })
    })

    it('debería devolver 400 si el nombre es vacío', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: user.id_user,
        name: 'Repartidor valido',
      })

      const response = await request(app)
        .patch(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '' })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'El nombre no puede estar vacío',
            }),
          ]),
        })
      )
    })

    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app)
        .patch(`${endpoint}/1`)
        .send({ name: 'Test' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Token requerido' }],
      })
    })
  })

  describe('DELETE /couriers/:id', () => {
    it('debería eliminar lógicamente un courier existente', async () => {
      const { accessToken, user } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: user.id_user,
        name: 'Repartidor eliminar',
      })

      const response = await request(app)
        .delete(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(204)
      const courierDB = await Courier.findByPk(courier.id_courier)
      expect(courierDB.deleted_at).not.toBeNull()
    })

    it('debería devolver 404 si el courier no pertenece al usuario', async () => {
      const otherUser = await createAuthenticatedUser()
      const { accessToken } = await createAuthenticatedUser()
      const courier = await Courier.create({
        id_user: otherUser.user.id_user,
        name: 'Repartidor seguro',
      })

      const response = await request(app)
        .delete(`${endpoint}/${courier.id_courier}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Repartidor no encontrado' }],
      })
    })

    it('debería devolver 400 si el id no es un número entero', async () => {
      const { accessToken } = await createAuthenticatedUser()

      const response = await request(app)
        .delete(`${endpoint}/abc`)
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

    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app).delete(`${endpoint}/1`)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        errors: [{ message: 'Token requerido' }],
      })
    })
  })
})
