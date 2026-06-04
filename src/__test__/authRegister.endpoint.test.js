import app from '../../app.js'
import request from 'supertest'
import User from '../db/models/User.js'
import sequelize from '../db/database.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('POST /register', () => {
  const endpoint = '/api/auth/register'
  it('Debe crear un usuario con rol owner aunque se envie otro rol', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '123G5678',
      role: 'admin',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Usuario creado correctamente!')
    expect(response.body.user).toMatchObject({
      id_user: expect.any(Number),
      email: dataUser.email,
      role: 'owner',
    })

    expect(response.body.user.password).toBeUndefined()
  })

  it('Debe mostrar error si el body está vacío', async () => {
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

  it('Debe mostrar error si el email ya está en uso', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '123G5678',
    }

    await request(app).post(endpoint).send(dataUser)

    const response = await request(app).post(endpoint).send(dataUser)

    const countEmail = await User.count({
      where: {
        email: dataUser.email,
      },
    })

    expect(response.status).toBe(409)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'El email ya está en uso',
          }),
        ]),
      })
    )
    expect(countEmail).toBe(1)
  })

  it('Debe mostrar error si el email tiene un formato inválido', async () => {
    const dataUser = {
      email: `correo-invalido`,
      password: '12G45678',
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

  it('Debe mostrar error si el email está vacío', async () => {
    const dataUser = {
      email: ``,
      password: '123G5678',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'El email es obligatorio',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar error si no se envía el email', async () => {
    const dataUser = {
      password: '1G345678',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'El email es obligatorio',
          }),
        ]),
      })
    )
  })

  it('Debe mostrar error si la contraseña tiene menos de 8 caracteres', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567',
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

  it('Debe mostrar error si la contraseña tiene más de 16 caracteres', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: 'hoLapruebadeerrorDeContraseña',
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

  it('Debe mostrar error si el password está vacío', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '',
    }

    const response = await request(app).post(endpoint).send(dataUser)

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

  it('Debe mostrar error si no se envia el password', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
    }

    const response = await request(app).post(endpoint).send(dataUser)

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

  it('Debe mostrar un error para la contraseña cuando no sea de tipo string', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: 123456768,
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

  it('Debe mostrar un error para la contraseñas con muchos espacios', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '   ',
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

  it('Debe mostrar un error cuando la contraseña no contiene una letra mayúscula', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: 'holaesunaprueba',
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
