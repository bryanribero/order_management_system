import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

async function createAuthenticatedUser() {
  const credentials = {
    email: `user-endpoint-${crypto.randomUUID()}@hotmail.com`,
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
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('PATCH /api/users', () => {
  const endpoint = '/api/users'

  it('debe actualizar el email y la contraseña del usuario autenticado', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const setter = {
      email: `updated-${crypto.randomUUID()}@hotmail.com`,
      password: 'NewPass123',
    }

    const response = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(setter)

    expect(response.status).toBe(204)
    expect(response.body).toEqual({})

    const userDb = await User.scope('withPassword').findByPk(user.id_user)
    expect(userDb.email).toBe(setter.email)
  })

  it('debe devolver 401 si no se envía access token', async () => {
    const response = await request(app)
      .patch(endpoint)
      .send({
        email: `updated-${crypto.randomUUID()}@hotmail.com`,
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

  it('debe devolver 400 si no se envía email ni password', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Debe enviar al menos el email o la contraseña',
          }),
        ]),
      })
    )
  })
})

describe('DELETE /api/users/delete', () => {
  const endpoint = '/api/users/delete'

  it('debe eliminar el usuario autenticado cuando la contraseña es correcta', async () => {
    const { user, accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: '1234567A' })

    expect(response.status).toBe(204)
    expect(response.body).toEqual({})

    const userDb = await User.findByPk(user.id_user)
    expect(userDb).toBeNull()
  })

  it('debe devolver 401 si la contraseña es incorrecta', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: 'Incorrecta123' })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      success: false,
      errors: [
        {
          message: 'Password incorrecto',
        },
      ],
    })
  })

  it('debe devolver 400 si no se envía password', async () => {
    const { accessToken } = await createAuthenticatedUser()

    const response = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña es obligatoria',
          }),
        ]),
      })
    )
  })
})
