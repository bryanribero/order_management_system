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
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('refreshService', () => {
  it('debería devolver nuevos tokens', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const payload = verifyToken(refreshToken, 'refresh')

    const result = await refreshService(payload)

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
