import User from '../db/models/User.js'
import { comparePassword, registerNewUser } from '../services/auth.service.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

describe('Auth Service - registerNewUser', () => {
  it('Debe crear un usuario con rol owner y sin devolver el password', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '12345678',
      role: 'admin',
    }

    const newUser = await registerNewUser(dataUser)

    expect(newUser).toMatchObject({
      id_user: expect.any(Number),
      email: dataUser.email,
      role: 'owner',
    })

    expect(newUser.password).toBeUndefined()
  })

  it('Debe guardar una contraseña hasheada que coincida con la original', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: 12345678,
    }

    const newUser = await registerNewUser(dataUser)

    const userDb = await User.scope('withPassword').findByPk(newUser.id_user)

    const isValidPassword = await comparePassword(
      dataUser.password,
      userDb.password
    )

    expect(isValidPassword).toBe(true)
  })

  it('Debe lanzar un error si el email ya está en uso', async () => {
    const dataUser = {
      email: `prueba-${crypto.randomUUID()}@hotmail.com`,
      password: '12345678',
    }

    await registerNewUser(dataUser)

    await expect(registerNewUser(dataUser)).rejects.toMatchObject({
      status: 409,
      message: 'El email ya está en uso',
    })
  })
})
