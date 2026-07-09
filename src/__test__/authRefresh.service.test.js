import sequelize from '../db/database.js'
import RefreshToken from '../db/models/RefreshToken.js'
import User from '../db/models/User.js'
import {
  loginUser,
  refreshService,
  registerNewUser,
} from '../services/auth/auth.service.js'
import { verifyToken } from '../services/auth/utils/tokens.utils.js'
import crypto from 'crypto'

afterEach(async () => {
  await RefreshToken.destroy({
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

describe('POST /auth/refresh - refreshService', () => {
  it('debería verificar el refresh token activo y devolver nuevos tokens', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const payload = verifyToken(refreshToken, 'refresh')

    const result = await refreshService(payload)

    expect(result.refreshToken).not.toBe(refreshToken)
    expect(result).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
  })

  it('debería revocar los refresh tokens anteriores', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const user = await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const payload = verifyToken(refreshToken, 'refresh')

    const refreshTokenDB = await RefreshToken.findOne({
      where: { id_user: user.id_user, revoked_at: null },
    })

    await refreshService(payload)

    const oldRefreshTokenDB = await RefreshToken.findByPk(
      refreshTokenDB.id_rtoken
    )

    expect(oldRefreshTokenDB.revoked_at).not.toBeNull()
  })

  it('debería rechazar si el refresh token activo está expirado', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const user = await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const payload = verifyToken(refreshToken, 'refresh')

    await RefreshToken.update(
      {
        expires_at: new Date(Date.now() - 1000),
      },
      {
        where: {
          id_user: user.id_user,
          revoked_at: null,
        },
      }
    )

    await expect(refreshService(payload)).rejects.toMatchObject({
      message: 'Token expirado',
      status: 401,
    })
  })

  it('debería rechazar si no existe un refresh token activo para el usuario', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const user = await registerNewUser(dataUser)

    await expect(
      refreshService({ id_user: user.id_user })
    ).rejects.toMatchObject({
      message: 'Token revocado',
      status: 401,
    })
  })

  it('debería almacenar el hash del nuevo refresh token', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const user = await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const payload = verifyToken(refreshToken, 'refresh')

    const result = await refreshService(payload)

    const newRefreshTokenDB = await RefreshToken.findOne({
      where: { id_user: user.id_user, revoked_at: null },
    })

    expect(newRefreshTokenDB).not.toBeNull()

    const hashRefreshTokenTest = crypto
      .createHash('sha256')
      .update(result.refreshToken)
      .digest('hex')

    expect(hashRefreshTokenTest).toBe(newRefreshTokenDB.token_hash)
  })
})
