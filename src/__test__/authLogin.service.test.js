import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth.service.js'
import jwt from 'jsonwebtoken'
import RefreshToken from '../db/models/RefreshToken.js'
import crypto from 'crypto'
import { Op } from 'sequelize'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('loginUser', () => {
  it('debería autenticar un usuario y devolver un access token y refresh token válidos', async () => {
    const dataUser = {
      email: `Test-${crypto.randomUUID()}@hotmail.com`,
      password: `testeoLogin`,
    }

    await registerNewUser(dataUser)

    const response = await loginUser(dataUser)

    expect(response).toHaveProperty('accessToken')
    expect(response).toHaveProperty('refreshToken')

    expect(typeof response.accessToken).toBe('string')
    expect(typeof response.refreshToken).toBe('string')

    const accessPayload = jwt.verify(
      response.accessToken,
      process.env.JWT_ACCESS_SECRET
    )

    const refreshPayload = jwt.verify(
      response.refreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    expect(accessPayload.id_user).toBeDefined()
    expect(accessPayload.email).toBe(dataUser.email.trim().toLocaleLowerCase())
    expect(accessPayload.role).toBe('owner')

    expect(refreshPayload.id_user).toBeDefined()

    expect(accessPayload.exp - accessPayload.iat).toBe(60 * 60)
    expect(refreshPayload.exp - refreshPayload.iat).toBe(7 * 24 * 60 * 60)
  })

  it('Debe dar error si el email no coincide con ningun usuario', async () => {
    const dataUser = {
      email: `noExiste@hotmail.com`,
      password: `testeoLogin`,
    }

    await expect(loginUser(dataUser)).rejects.toMatchObject({
      message: 'Credenciales inválidas',
      status: 401,
    })
  })

  it('Debe dar error si las credenciales de password estan mal', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'passwordtest123',
    }

    await registerNewUser(dataUser)

    await expect(
      loginUser({ email: dataUser.email, password: 'otracontraseña' })
    ).rejects.toMatchObject({
      message: 'Credenciales inválidas',
      status: 401,
    })
  })

  it('Debe de coincidir el refreshToken dado con el token guardado en la base de datos', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'pasSwordtest123',
    }

    const user = await registerNewUser(dataUser)

    const userLogin = await loginUser(dataUser)

    const refreshTokenDB = await RefreshToken.findOne({
      where: {
        id_user: user.id_user,
      },
    })

    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(userLogin.refreshToken)
      .digest('hex')

    expect(refreshTokenDB).not.toBeNull()
    expect(hashedRefreshToken).toBe(refreshTokenDB.token_hash)
  })

  it('debería revocar el refresh token anterior al generar uno nuevo para el mismo usuario', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'pasSwordtest123',
    }
    const user = await registerNewUser(dataUser)

    await loginUser(dataUser)

    await loginUser(dataUser)

    const refreshTokenRevoked = await RefreshToken.findOne({
      where: {
        id_user: user.id_user,
        revoked_at: {
          [Op.not]: null,
        },
      },
    })

    expect(refreshTokenRevoked).not.toBeNull()
    expect(refreshTokenRevoked.revoked_at).toBeInstanceOf(Date)
  })
})
