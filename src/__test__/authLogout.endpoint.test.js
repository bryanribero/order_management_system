import request from 'supertest'
import app from '../../app.js'
import User from '../db/models/User.js'
import sequelize from '../db/database.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'
import RefreshToken from '../db/models/RefreshToken.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('POST /auth/logout', () => {
  const endpoint = '/api/auth/logout'

  it('debería revocar los refresh tokens del usuario y devolver una respuesta exitosa', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const user = await registerNewUser(dataUser)

    const { accessToken } = await loginUser(dataUser)

    const response = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Sesión cerrada correctamente',
    })

    const refresh = await RefreshToken.findOne({
      where: {
        id_user: user.id_user,
      },
    })

    expect(refresh.revoked_at).not.toBeNull()
  })
})
