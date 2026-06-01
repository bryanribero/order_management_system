import app from '../../app.js'
import request from 'supertest'
import User from '../db/models/User.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

describe('POST /register', () => {
  const endpoint = '/api/auth/register'
  it('Debe crear un usuario con rol owner aunque se envie otro rol', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '12345678',
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
  })

  it('Debe mostrar error si el body está vacío', async () => {
    const response = await request(app).post(endpoint).send({})

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain('El email es obligatorio')
    expect(response.body.errors.messages).toContain(
      'La contraseña es obligatoria'
    )
  })

  it('Debe mostrar error si el email ya está en uso', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '12345678',
    }

    await request(app).post(endpoint).send(dataUser)

    const response = await request(app).post(endpoint).send(dataUser)

    const countEmail = await User.count({
      where: {
        email: dataUser.email,
      },
    })

    expect(response.status).toBe(409)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain('El email ya está en uso')
    expect(countEmail).toBe(1)
  })

  it('Debe mostrar error si el email tiene un formato inválido', async () => {
    const dataUser = {
      email: `correo-invalido`,
      password: '12345678',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain(
      'El email ingresado no es válido'
    )
  })

  it('Debe mostrar error si el email está vacío', async () => {
    const dataUser = {
      email: ``,
      password: '12345678',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain('El email es obligatorio')
  })

  it('Debe mostrar error si no se envía el email', async () => {
    const dataUser = {
      password: '12345678',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain('El email es obligatorio')
  })

  it('Debe mostrar error si la contraseña tiene menos de 8 caracteres', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain(
      'La contraseña debe de contener entre 8 y 16 caracteres'
    )
  })

  it('Debe mostrar error si la contraseña tiene más de 16 caracteres', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: 'holapruebadeerrorDeContraseña',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain(
      'La contraseña debe de contener entre 8 y 16 caracteres'
    )
  })

  it('Debe mostrar error si el password está vacío', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '',
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain(
      'La contraseña es obligatoria'
    )
  })

  it('Debe mostrar error si no se envia el password', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.errors.messages).toContain(
      'La contraseña es obligatoria'
    )
  })
})
