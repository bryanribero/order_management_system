import crypto from 'crypto'
import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import { comparePassword } from '../services/auth/utils/passwords.utils.js'
import { updateUser, deleteUser } from '../services/users/users.service.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

async function createUser() {
  return await registerNewUser({
    email: `user-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

describe('User Service - updateUser', () => {
  it('debe actualizar el email y la contraseña del usuario autenticado', async () => {
    const user = await createUser()

    const updatedPassword = 'NewPass123'
    const updatedData = {
      email: `updated-${crypto.randomUUID()}@hotmail.com`,
      password: updatedPassword,
    }

    const updatedUser = await updateUser(user.id_user, updatedData)

    expect(updatedUser).toMatchObject({
      id_user: user.id_user,
      email: updatedData.email,
      role: 'owner',
    })

    const userDb = await User.scope('withPassword').findByPk(user.id_user)

    const isValidPassword = await comparePassword(
      updatedPassword,
      userDb.password
    )

    expect(isValidPassword).toBe(true)
  })

  it('debe lanzar NotFoundError si el usuario no existe', async () => {
    await expect(
      updateUser(9999999, { email: 'noexiste@example.com' })
    ).rejects.toMatchObject({
      message: 'Usuario no encontrado',
      status: 404,
    })
  })
})

describe('User Service - deleteUser', () => {
  it('debe eliminar el usuario cuando la contraseña es correcta', async () => {
    const password = '1234567A'
    const user = await registerNewUser({
      email: `delete-${crypto.randomUUID()}@hotmail.com`,
      password,
    })

    await deleteUser(user.id_user, password)

    const userDb = await User.findByPk(user.id_user)

    expect(userDb).toBeNull()
  })

  it('debe lanzar AuthError si la contraseña es incorrecta', async () => {
    const user = await createUser()

    await expect(
      deleteUser(user.id_user, 'ContraseñaIncorrecta')
    ).rejects.toMatchObject({
      message: 'Password incorrecto',
      status: 401,
    })
  })

  it('debe lanzar NotFoundError si el usuario no existe', async () => {
    await expect(deleteUser(9999999, '1234567A')).rejects.toMatchObject({
      message: 'Usuario no encontrado',
      status: 404,
    })
  })
})
