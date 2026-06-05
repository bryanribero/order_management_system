import sequelize from '../db/database'
import User from '../db/models/User.js'
import app from '../../app.js'
import request from 'supertest'
import { registerNewUser } from '../services/auth.service.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('POST /login', () => {
  const endpoint = '/api/auth/login'
  it('debería autenticar un usuario existente con credenciales válidas y devolver accessToken y refreshToken', async () => {
    const userData = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'passwordTest',
    }

    await registerNewUser(userData)

    const response = await request(app).post(endpoint).send(userData)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      success: true,
      message: 'Inicio de sesión exitoso',
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
  })

  it('Debe mostrar error si no se envían campos en el cuerpo de la petición', async () => {
    const response = await request(app).post(endpoint).send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'El email es obligatorio',
          }),
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña es obligatoria',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar un error si el email ingresado no es de un formato válido', async () => {
    const dataUser = {
      email: `emailInvalido`,
      password: 'testCorrecto',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'El email ingresado no es válido',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar un error si el password no es un string', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 12345678,
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña debe ser texto',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar un error si la contraseña contiene espacios', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'hola como es',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña no puede contener espacios',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar un error si la contraseña tiene menos de 8 caracteres', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'ad',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña debe tener al menos 8 caracteres',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar un error si la contraseña tiene más de 16 caracteres', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'EstaContraseñaTieneMuchosCaracteres',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña debe de contener hasta 16 caracteres',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar un error si la contraseña no contiene al menos una letra mayúscula', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '12345678',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'La contraseña debe contener al menos una letra mayúscula',
          }),
        ]),
      })
    )
  })
})
