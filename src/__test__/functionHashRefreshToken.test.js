import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { hashRefreshToken } from '../services/auth/utils/tokens.utils.js'
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

describe('hashRefreshToken', () => {
  it('debería hashear un refresh token correctamente', () => {
    const refreshToken = 'tokenCorrecto'

    const hashedToken = hashRefreshToken(refreshToken)

    expect(crypto.createHash('sha256').update(refreshToken).digest('hex')).toBe(
      hashedToken
    )
  })

  it('debería lanzar un error si refreshToken es undefined', () => {
    expect(() => hashRefreshToken()).toThrow()
  })

  it('debería lanzar un error si refreshToken no es un String', () => {
    expect(() => hashRefreshToken(122)).toThrow()
  })

  it('debería lanzar un error si refreshToken está vacío', () => {
    expect(() => hashRefreshToken('')).toThrow()
  })
})
