import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { generateTokens } from '../services/auth/utils/tokens.utils.js'
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

describe('generateTokens', () => {
  it('debería generar un access token y un refresh token válidos', () => {
    const payload = {
      id_user: 1,
      email: 'test@hotmail.com',
      role: 'owner',
    }

    const tokens = generateTokens(payload)

    expect(tokens).toHaveProperty('accessToken')
    expect(tokens).toHaveProperty('refreshToken')

    const accessPayload = jwt.verify(
      tokens.accessToken,
      process.env.JWT_ACCESS_SECRET
    )

    const refreshPayload = jwt.verify(
      tokens.refreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    expect(accessPayload.id_user).toBe(payload.id_user)
    expect(accessPayload.email).toBe(payload.email)
    expect(accessPayload.role).toBe(payload.role)

    expect(refreshPayload.id_user).toBe(payload.id_user)

    expect(accessPayload.exp - accessPayload.iat).toBe(60 * 60)
    expect(refreshPayload.exp - refreshPayload.iat).toBe(7 * 24 * 60 * 60)
  })

  it('debería lanzar un error si JWT_ACCESS_SECRET no está definido', () => {
    const originalSecret = process.env.JWT_ACCESS_SECRET

    delete process.env.JWT_ACCESS_SECRET

    const payload = {
      id_user: 1,
      email: 'test@hotmail.com',
      role: 'owner',
    }

    expect(() => generateTokens(payload)).toThrow()

    process.env.JWT_ACCESS_SECRET = originalSecret
  })

  it('debería lanzar un error si JWT_REFRESH_SECRET no está definido', () => {
    const originalSecret = process.env.JWT_REFRESH_SECRET

    delete process.env.JWT_REFRESH_SECRET

    const payload = {
      id_user: 1,
      email: 'test@hotmail.com',
      role: 'owner',
    }

    expect(() => generateTokens(payload)).toThrow()

    process.env.JWT_REFRESH_SECRET = originalSecret
  })

  it('debería lanzar un error si el payload es inválido', () => {
    expect(() => generateTokens(null)).toThrow('Payload inválido')

    expect(() => generateTokens({})).toThrow('Payload inválido')
  })
})
