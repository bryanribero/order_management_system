import request from 'supertest'
import crypto from 'crypto'
import app from '../../app.js'
import sequelize from '../db/database.js'
import RefreshToken from '../db/models/RefreshToken.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'
import { hashRefreshToken } from '../services/auth/utils/tokens.utils.js'

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

describe('POST /auth/refresh', () => {
  const endpoint = '/api/auth/refresh'

  it('debería renovar los tokens con un refresh token válido', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const user = await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const activeRefreshToken = await RefreshToken.findOne({
      where: {
        id_user: user.id_user,
        revoked_at: null,
      },
    })

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Tokens renovados correctamente',
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
    expect(response.body.refreshToken).not.toBe(refreshToken)

    const revokedRefreshToken = await RefreshToken.findByPk(
      activeRefreshToken.id_rtoken
    )

    const newRefreshToken = await RefreshToken.findOne({
      where: {
        id_user: user.id_user,
        revoked_at: null,
      },
    })

    expect(revokedRefreshToken.revoked_at).not.toBeNull()
    expect(newRefreshToken).not.toBeNull()
    expect(newRefreshToken.token_hash).toBe(
      hashRefreshToken(response.body.refreshToken)
    )
  })

  it('debería devolver error si no se envía el refresh token', async () => {
    const response = await request(app).post(endpoint)

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
})
