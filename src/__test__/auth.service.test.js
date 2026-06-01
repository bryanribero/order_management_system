import app from '../../app.js'
import request from 'supertest'
import User from '../db/models/User.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

describe('Auth Service', () => {
  describe('POST /register', () => {
    it('Debera de crear un nuevo usuario', async () => {
      const dataUser = {
        email: `prueba-${crypto.randomUUID()}@hotmail.com`,
        password: '12345678',
        role: 'admin',
      }

      const response = await request(app)
        .POST('/api/auth/register')
        .send(dataUser)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Usuario creado correctamente!')
      expect(response.body.user).toMatchObject({
        id_user: expect.any(Number),
        email: dataUser.email,
        role: 'owner',
      })
    })

    it('Tiene que mostrar error de unicidad de email', async () => {
      const dataUser = {
        email: `prueba-${crypto.randomUUID()}@hotmail.com`,
        password: '12345678',
      }

      await request(app).POST('/api/auth/register').send(dataUser)

      const response = await request(app)
        .POST('/api/auth/register')
        .send(dataUser)

      const countEmail = await User.count({
        where: {
          email: dataUser.email,
        },
      })

      expect(response.status).toBe(409)
      expect(response.body.error.message).toBe('El email ya está en uso')
      expect(countEmail).toBe(1)
    })
  })
})
