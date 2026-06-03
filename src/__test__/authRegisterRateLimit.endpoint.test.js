import User from '../db/models/User.js'
import request from 'supertest'
import app from '../../app.js'
import sequelize from '../db/database.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('POST /auth/register - rate limit', () => {
  const endpoint = '/api/auth/register'

  it('Debe responder 429 cuando se supera el límite de registros', async () => {
    const dataUser = {
      email: `test-rate-limit@hotmail.com`,
      password: '1233424234',
    }

    for (let i = 0; i < 25; i++) {
      await request(app)
        .post(endpoint)
        .send({
          ...dataUser,
          email: `test-rate-limit-${i}@hotmail.com`,
        })
    }

    const response = await request(app).post(endpoint).send(dataUser)

    expect(response.status).toBe(429)
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message:
              'Demasiados intentos de registro. Intenta nuevamente más tarde.',
          }),
        ]),
      })
    )
  })
})
