import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import RefreshToken from '../db/models/RefreshToken.js'
import { createRefreshToken } from '../services/auth/utils/tokens.utils.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('createRefreshToken', () => {
  it('debería crear un refresh token en la base de datos', async () => {
    const user = await User.create({
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    })

    const refreshToken = 'Token-refresh'

    await createRefreshToken(user.id_user, refreshToken)

    const storedToken = await RefreshToken.findOne({
      where: {
        id_user: user.id_user,
      },
    })

    expect(storedToken).not.toBeNull()
    expect(storedToken.id_user).toBe(user.id_user)
    expect(storedToken.token_hash).not.toBe(refreshToken)
    expect(storedToken.revoked_at).toBeNull()
    expect(storedToken.expires_at).toBeInstanceOf(Date)
  })

  it('debería lanzar un error si idUser es undefined', async () => {
    const refresh = 'token-refresh'

    await expect(createRefreshToken(refresh)).rejects.toThrow(
      'El parametro idUser es invalido'
    )
  })

  it('debería lanzar un error si idUser es null', async () => {
    const refresh = 'token-refresh'

    await expect(createRefreshToken(null, refresh)).rejects.toThrow(
      'El parametro idUser es invalido'
    )
  })

  it('debería lanzar un error si idUser no es un numero entero', async () => {
    const refresh = 'token-refresh'

    await expect(createRefreshToken('hola', refresh)).rejects.toThrow(
      'El parametro idUser es invalido'
    )
  })

  it('debería lanzar un error si idUser es un numero igual o menor a 0', async () => {
    const refresh = 'token-refresh'

    await expect(createRefreshToken(-1, refresh)).rejects.toThrow(
      'El parametro idUser es invalido'
    )
  })
})
