import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { loginUser, registerNewUser } from '../services/auth.service.js'
import jwt from 'jsonwebtoken'

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
      email: `Test-${crypto.randomUUID}@hotmail.com`,
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
      process.env.JJWT_REFRESH_SECRET
    )

    expect(accessPayload.id_user).toBeDefined()
    expect(accessPayload.email).toBe(dataUser.email)
    expect(accessPayload.role).toBe('owner')

    expect(refreshPayload.id_user).toBeDefined()

    expect(accessPayload.exp - accessPayload.iat).toBe(60 * 60)
    expect(refreshPayload.exp - refreshPayload.iat).toBe(7 * 24 * 60 * 60)
  })
})
